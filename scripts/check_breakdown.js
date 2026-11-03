const db = require('../lib/db.js');
const r = db.getDb().prepare(`
  SELECT s.id, s.name, q.question_type, count(q.id) as c
  FROM questions q
  JOIN subjects s ON s.id = q.subject_id
  WHERE s.class_id = 1 AND q.is_active = 1
  GROUP BY s.id, q.question_type
  ORDER BY s.id, q.question_type
`).all();

const summary = {};
for (const row of r) {
  if (!summary[row.name]) summary[row.name] = { id: row.id };
  summary[row.name][row.question_type] = row.c;
}
console.log(JSON.stringify(summary, null, 2));
