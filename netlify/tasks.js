const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sqlite3.db', (err) => {
  if (err) console.error('Datenbankfehler:', err.message);
});

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    // Alle Aufgaben abrufen
    return new Promise((resolve) => {
      db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
          resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
        } else {
          resolve({ statusCode: 200, body: JSON.stringify(rows) });
        }
      });
    });
  }

  if (event.httpMethod === 'POST') {
    // Neue Aufgabe hinzufügen
    const { title, description, room, due_date } = JSON.parse(event.body);
    return new Promise((resolve) => {
      db.run(
        `INSERT INTO tasks (title, description, room, due_date) VALUES (?, ?, ?, ?)`,
        [title, description, room, due_date],
        function (err) {
          if (err) {
            resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
          } else {
            resolve({
              statusCode: 201,
              body: JSON.stringify({ id: this.lastID, title, description, room, due_date }),
            });
          }
        }
      );
    });
  }

  if (event.httpMethod === 'PUT') {
    // Aufgabe als erledigt markieren
    const { id } = event.queryStringParameters;
    const { member_id } = JSON.parse(event.body);
    const done_date = new Date().toISOString().split('T')[0];

    return new Promise((resolve) => {
      db.run(
        `UPDATE tasks SET status = 'done', done_by = ?, done_date = ? WHERE id = ?`,
        [member_id, done_date, id],
        function (err) {
          if (err) {
            resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
          } else if (this.changes === 0) {
            resolve({ statusCode: 404, body: JSON.stringify({ error: 'Aufgabe nicht gefunden.' }) });
          } else {
            resolve({ statusCode: 200, body: JSON.stringify({ id, status: 'done', done_by: member_id, done_date }) });
          }
        }
      );
    });
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
