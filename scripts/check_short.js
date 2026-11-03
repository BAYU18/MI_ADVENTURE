const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/home/maman/play/data/play.db');
const rows = db.prepare("SELECT id, text, question_type, type_data_json, options_json, answer_index FROM questions WHERE question_type='SHORT' LIMIT 5").all();
console.log(JSON.stringify(rows, null, 2));
