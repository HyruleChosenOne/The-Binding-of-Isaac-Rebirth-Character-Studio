import http from 'http';
import { app } from '../server/index.js';
import { resetConfig } from '../server/config.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    failed++;
  }
}

function request(server, method, path, body = null) {
  const addr = server.address();
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: addr.port,
      path: path,
      method: method,
      headers: {}
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(opts, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks)
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runHttpTests() {
  console.log('\n======================================================');
  console.log('  RUNNING SERVER HTTP ENDPOINT VERIFICATION');
  console.log('======================================================\n');

  resetConfig();

  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  const port = server.address().port;
  console.log(`Test server active on port ${port}\n`);

  try {
    // 1. Health check
    console.log('--- Endpoint Test 1: Health & Status ---');
    const healthRes = await request(server, 'GET', '/health');
    assert(healthRes.statusCode === 200, `/health returns 200`);

    const statusRes = await request(server, 'GET', '/api/status');
    assert(statusRes.statusCode === 200, `/api/status returns 200`);
    const statusData = JSON.parse(statusRes.body.toString('utf8'));
    assert(statusData.availableSpriteCount >= 34, `/api/status returns availableSpriteCount = ${statusData.availableSpriteCount} (>=34)`);
    assert(statusData.config.useBundledVanillaAssets === true, `useBundledVanillaAssets is true in /api/status`);

    // 2. Character Sprites
    console.log('\n--- Endpoint Test 2: Character Sprite Endpoints ---');
    const isaacSprite = await request(server, 'GET', '/assets/sprites/character_001_isaac.png');
    assert(isaacSprite.statusCode === 200, `/assets/sprites/character_001_isaac.png returns 200`);
    assert(isaacSprite.headers['content-type']?.includes('image/png'), `character_001_isaac content-type is image/png`);

    const maggySprite = await request(server, 'GET', '/assets/sprites/character_002_magdalene.png');
    assert(maggySprite.statusCode === 200, `/assets/sprites/character_002_magdalene.png returns 200`);

    const bethSprite = await request(server, 'GET', '/assets/sprites/character_018_bethany.png');
    assert(bethSprite.statusCode === 200, `/assets/sprites/character_018_bethany.png returns 200`);

    // 3. Character Portraits
    console.log('\n--- Endpoint Test 3: Character Portrait Endpoints ---');
    const isaacPortrait = await request(server, 'GET', '/assets/portraits/playerportrait_isaac.png');
    assert(isaacPortrait.statusCode === 200, `/assets/portraits/playerportrait_isaac.png returns 200`);
    assert(isaacPortrait.headers['content-type']?.includes('image/png'), `playerportrait_isaac content-type is image/png`);

    // 4. Collectibles & Trinkets by ID
    console.log('\n--- Endpoint Test 4: Collectibles & Trinkets by ID ---');
    const item1 = await request(server, 'GET', '/assets/items/id/1');
    assert(item1.statusCode === 200, `/assets/items/id/1 returns 200`);
    assert(item1.headers['content-type']?.includes('image/png'), `/assets/items/id/1 content-type is image/png`);

    const item700 = await request(server, 'GET', '/assets/items/id/700');
    assert(item700.statusCode === 200, `/assets/items/id/700 returns 200`);

    const trinket1 = await request(server, 'GET', '/assets/trinkets/id/1');
    assert(trinket1.statusCode === 200, `/assets/trinkets/id/1 returns 200`);
    assert(trinket1.headers['content-type']?.includes('image/png'), `/assets/trinkets/id/1 content-type is image/png`);

    // 5. Pocket Items & Consumables
    console.log('\n--- Endpoint Test 5: Pocket Items by ID ---');
    const pocket1 = await request(server, 'GET', '/assets/pocket/id/1');
    assert(pocket1.statusCode === 200, `/assets/pocket/id/1 returns 200`);
    assert(pocket1.headers['content-type']?.includes('image/png'), `/assets/pocket/id/1 content-type is image/png`);

    // 6. UI HUD Hearts
    console.log('\n--- Endpoint Test 6: UI HUD Hearts ---');
    const heartRed = await request(server, 'GET', '/assets/ui/hearts/heart_red_full.png');
    assert(heartRed.statusCode === 200, `/assets/ui/hearts/heart_red_full.png returns 200`);

    // 7. Fallbacks for missing assets
    console.log('\n--- Endpoint Test 7: Fallbacks for Missing Assets ---');
    const missingItem = await request(server, 'GET', '/assets/items/non_existent_random_xyz_9999.png');
    assert(missingItem.statusCode === 200, `Missing item returns 200 with fallback SVG`);
    assert(missingItem.headers['content-type']?.includes('image/svg+xml'), `Missing item returns SVG content-type`);

    // 8. Manual Extraction Route
    console.log('\n--- Endpoint Test 8: Manual Extraction Route ---');
    const extractRes = await request(server, 'POST', '/api/extract/start', JSON.stringify({ gamePath: '' }));
    assert(extractRes.statusCode === 200, `/api/extract/start route responds 200`);
    const extractData = JSON.parse(extractRes.body.toString('utf8'));
    assert(extractData.success === false, `Extraction without gamePath gracefully returns success: false with message`);

    console.log('\n======================================================');
    console.log(`  HTTP TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runHttpTests().catch(err => {
  console.error('HTTP Test error:', err);
  process.exit(1);
});
