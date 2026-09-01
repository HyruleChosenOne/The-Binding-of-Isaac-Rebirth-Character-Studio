import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';
import { detectPaths, getConfig } from './config.js';
import { refreshAssetIndex } from './services/assetResolver.js';
import apiRouter from './routes/api.js';
import assetsRouter from './routes/assets.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Client Connection & Auto-Shutdown Watchdog ───
let clientEverConnected = false;
let lastHeartbeatTime = Date.now();
const STARTUP_GRACE_PERIOD_MS = 60000; // 60s initial grace period for browser to open
const HEARTBEAT_TIMEOUT_MS = 8000;      // 8s without heartbeat triggers auto-shutdown
const serverStartTime = Date.now();
let shutdownTimer = null;

function markClientActive() {
  clientEverConnected = true;
  lastHeartbeatTime = Date.now();
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
    shutdownTimer = null;
  }
}

// Activity tracking middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/assets') || req.path === '/' || req.path === '/index.html') {
    markClientActive();
  }
  next();
});

// Dedicated heartbeat endpoint
app.all(['/api/heartbeat', '/api/ping', '/heartbeat'], (req, res) => {
  markClientActive();
  res.json({ status: 'ok', time: Date.now() });
});

// Explicit shutdown notification from client beforeunload
app.all(['/api/shutdown', '/api/server/shutdown-notify'], (req, res) => {
  res.json({ success: true, message: 'Shutting down...' });
  if (shutdownTimer) clearTimeout(shutdownTimer);
  shutdownTimer = setTimeout(() => {
    console.log('[Server] Browser window/tab closed. Shutting down server automatically...');
    process.exit(0);
  }, 2000);
});

// Periodic Watchdog to detect closed browser
setInterval(() => {
  const uptime = Date.now() - serverStartTime;
  if (uptime < STARTUP_GRACE_PERIOD_MS && !clientEverConnected) {
    return; // Still waiting for initial browser launch
  }

  if (clientEverConnected) {
    const elapsedSinceHeartbeat = Date.now() - lastHeartbeatTime;
    if (elapsedSinceHeartbeat > HEARTBEAT_TIMEOUT_MS) {
      console.log(`[Server] No client activity for ${Math.round(elapsedSinceHeartbeat / 1000)}s (Browser closed). Shutting down...`);
      process.exit(0);
    }
  }
}, 2000);

// Serve frontend static build if available
const candidateDistPaths = [
  path.join(__dirname, '..', 'client', 'dist'),
  path.join(__dirname, 'client', 'dist'),
  path.join(process.cwd(), 'client', 'dist'),
  path.join(process.cwd(), 'dist'),
  ...(process.resourcesPath ? [path.join(process.resourcesPath, 'app', 'client', 'dist')] : [])
];

let clientDistPath = candidateDistPaths[0];
for (const p of candidateDistPaths) {
  if (p && fs.existsSync(p)) {
    clientDistPath = p;
    break;
  }
}

console.log(`[Server] Serving static client build from: ${clientDistPath}`);
app.use(express.static(clientDistPath));

// Health check endpoint
app.get('/health', (req, res) => {
  markClientActive();
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount API and Game Assets routers
app.use('/api', apiRouter);
app.use('/assets', assetsRouter);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/assets')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath, (err) => {
      if (err) next();
    });
  } else {
    next();
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function freePort(targetPort) {
  let killed = false;
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${targetPort}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      const lines = output.trim().split('\n');
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && parseInt(pid, 10) !== process.pid) {
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
              killed = true;
            } catch (e) {}
          }
        }
      }
    }
  } catch (e) {}
  return killed;
}

export async function startServer(port = PORT, retries = 3) {
  const detected = await detectPaths();
  console.log('=====================================================');
  console.log('  ISAAC CHARACTER CREATION STUDIO 0.8');
  console.log('  Repentance & Repentance+ Edition');
  console.log('=====================================================');
  console.log(`- Game Path Detected : ${detected.gamePath || 'Not configured (standalone mode)'}`);
  console.log(`- Mods Path Detected : ${detected.modsPath || 'Not configured (can set in UI)'}`);
  console.log(`- Target DLC Default : ${detected.targetDLC}`);
  console.log(`- Asset Engine       : Bundled Vanilla Assets (34 Characters & Base Catalog)`);
  console.log('-----------------------------------------------------');

  // Asynchronously index bundled assets and active mods
  refreshAssetIndex().catch(() => {});

  if (freePort(port)) {
    await sleep(250);
  }

  return new Promise((resolve, reject) => {
    function tryListen(attemptsLeft) {
      const server = app.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log(`>>> Isaac Studio is running at: ${url}`);
        console.log(`>>> Opening browser automatically...`);
        
        // Auto-open browser via standard Windows start
        try {
          if (process.platform === 'win32') {
            const child = spawn('cmd.exe', ['/c', 'start', '""', url], {
              detached: true,
              stdio: 'ignore'
            });
            child.unref();
          } else if (process.platform === 'darwin') {
            const child = spawn('open', [url], { detached: true, stdio: 'ignore' });
            child.unref();
          } else {
            const child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
            child.unref();
          }
        } catch (e) {
          console.warn('[Server] Auto-open notice:', e.message);
        }

        resolve({ app, server, port });
      });

      server.on('error', async (err) => {
        if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
          console.log(`[Server] Port ${port} busy, retrying in 350ms (${attemptsLeft} retries left)...`);
          freePort(port);
          await sleep(350);
          tryListen(attemptsLeft - 1);
        } else {
          console.error('[Server Error] Listen error:', err);
          reject(err);
        }
      });
    }

    tryListen(retries);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start automatically if executed directly as entrypoint
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer().catch(err => {
    console.error('[Server] Failed to initialize server:', err);
  });
}

export { app };
export default app;
