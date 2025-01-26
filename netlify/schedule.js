const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sqlite3.db', (err) => {
  if (err) console.error('Datenbankfehler:', err.message);
});

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    // Putzplan abrufen
    return new Promise((resolve) => {
      db.all(
        `
          SELECT 
            cs.id, cs.scheduled_date, 
            t.title, t.room, 
            m.first_name, m.last_name
          FROM cleaning_schedule cs
          JOIN tasks t ON cs.task_id = t.id
          JOIN members m ON cs.member_id = m.id
          ORDER BY cs.scheduled_date ASC
        `,
        [],
        (err, rows) => {
          if (err) {
            resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
          } else {
            resolve({ statusCode: 200, body: JSON.stringify(rows) });
          }
        }
      );
    });
  }

  if (event.httpMethod === 'POST') {
    // Neuen Putzplan-Eintrag hinzufügen
    const { task_id, member_id, scheduled_date } = JSON.parse(event.body);
    return new Promise((resolve) => {
      db.run(
        `INSERT INTO cleaning_schedule (task_id, member_id, scheduled_date) VALUES (?, ?, ?)`,
        [task_id, member_id, scheduled_date],
        function (err) {
          if (err) {
            resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
          } else {
            resolve({
              statusCode: 201,
              body: JSON.stringify({ id: this.lastID, task_id, member_id, scheduled_date }),
            });
          }
        }
      );
    });
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
