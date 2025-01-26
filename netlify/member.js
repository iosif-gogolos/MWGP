const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sqlite3.db', (err) => {
  if (err) console.error('Datenbankfehler:', err.message);
});

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    // Alle Mitglieder abrufen
    return new Promise((resolve) => {
      db.all('SELECT * FROM members', [], (err, rows) => {
        if (err) {
          resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
        } else {
          resolve({ statusCode: 200, body: JSON.stringify(rows) });
        }
      });
    });
  }

  if (event.httpMethod === 'POST') {
    // Neues Mitglied hinzufügen
    const { first_name, last_name, status, wg, room } = JSON.parse(event.body);
    return new Promise((resolve) => {
      db.run(
        `INSERT INTO members (first_name, last_name, status, wg, room) VALUES (?, ?, ?, ?, ?)`,
        [first_name, last_name, status || 'active', wg, room],
        function (err) {
          if (err) {
            resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
          } else {
            resolve({
              statusCode: 201,
              body: JSON.stringify({ id: this.lastID, first_name, last_name, status, wg, room }),
            });
          }
        }
      );
    });
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
