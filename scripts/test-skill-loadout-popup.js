const fs = require('fs');
const http = require('http');

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3002,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Player-Token': token } : {})
      }
    };
    const r = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, raw: data }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function run() {
  console.log('=== VERIFIKASI FITUR LOADOUT SKILL DAN POPUP ===');

  // 1. Audit Client Code
  const appJs = fs.readFileSync('/home/maman/play/public/js/app.js', 'utf8');
  const hasSlotModal = appJs.includes('openSelectSkillForSlotModal');
  const hasReplaceModal = appJs.includes('openSelectSlotToReplaceModal');
  const hasSlotClick = appJs.includes('openSelectSkillForSlotModal(idx, loadout, skillsList)');
  const hasEquipClick = appJs.includes('openSelectSlotToReplaceModal(sk, loadout, skillsList)');
  const hasUnequip = appJs.includes('btn-unequip-slot');

  console.log('1. Check openSelectSkillForSlotModal:', hasSlotModal ? 'PASS' : 'FAIL');
  console.log('2. Check openSelectSlotToReplaceModal:', hasReplaceModal ? 'PASS' : 'FAIL');
  console.log('3. Check loadout-slot click binding:', hasSlotClick ? 'PASS' : 'FAIL');
  console.log('4. Check btn-equip-skill click binding:', hasEquipClick ? 'PASS' : 'FAIL');
  console.log('5. Check unequip button present:', hasUnequip ? 'PASS' : 'FAIL');

  if (!hasSlotModal || !hasReplaceModal || !hasSlotClick || !hasEquipClick || !hasUnequip) {
    throw new Error('Client code audit failed!');
  }

  // 2. Test API Loadout Operations
  const nick = 'TestSlot_' + Math.floor(Math.random() * 100000);
  const reg = await req('POST', '/api/auth/register', { nick, password: 'password123', classId: 'pendekar' });
  const token = reg.body.token;

  const initial = await req('GET', '/api/skills', null, token);
  console.log('Initial loadout:', initial.body.loadout);

  // Swap Slot 0 and 1
  const swapped = [initial.body.loadout[1], initial.body.loadout[0], initial.body.loadout[2]];
  const updateRes = await req('PUT', '/api/loadout', { slots: swapped }, token);
  console.log('Swapped update status:', updateRes.status);

  const afterSwap = await req('GET', '/api/skills', null, token);
  console.log('Loadout after swap:', afterSwap.body.loadout);
  if (afterSwap.body.loadout[0] !== swapped[0] || afterSwap.body.loadout[1] !== swapped[1]) {
    throw new Error('Swap loadout mismatch!');
  }

  // Unequip Slot 2
  const unequipped = [afterSwap.body.loadout[0], afterSwap.body.loadout[1]];
  await req('PUT', '/api/loadout', { slots: unequipped }, token);
  const afterUnequip = await req('GET', '/api/skills', null, token);
  console.log('Loadout after unequip slot 2:', afterUnequip.body.loadout);
  if (afterUnequip.body.loadout.length !== 2) {
    throw new Error('Unequip loadout mismatch!');
  }

  console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

run().catch(e => {
  console.error('Test Error:', e);
  process.exit(1);
});
