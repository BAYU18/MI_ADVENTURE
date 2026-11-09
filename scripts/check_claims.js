const db = require('../lib/db');
const raw = db.getDb();
const players = raw.prepare('SELECT id, nick, coins, xp FROM players WHERE id IN (8, 168)').all();
console.log('Players 8 and 168:', players);

const coinTx = raw.prepare('SELECT * FROM coin_transactions WHERE player_id IN (8, 168) ORDER BY id DESC LIMIT 10').all();
console.log('Recent coin transactions:', coinTx);
