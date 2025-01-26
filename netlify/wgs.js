const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sqlite3.db', (err) => {
  if (err) console.error('Datenbankfehler:', err.message);
});

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return new Promise((resolve) => {
      db.all('SELECT * FROM wgs', [], (err, rows) => {
        if (err) {
          resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
        } else {
          resolve({ statusCode: 200, body: JSON.stringify(rows) });
        }
      });
    });
  }

  return { statusCode: 405, body: 'Method not allowed' };
};