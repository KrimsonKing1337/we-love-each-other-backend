const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = 'db.sqlite';

const db = new sqlite3.Database(DBSOURCE, (dataBaseError) => {
  if (dataBaseError) {
    // Cannot open database
    console.error(dataBaseError.message);

    throw dataBaseError;
  }

  console.log('Connected to the SQLite database.');

  db.run(`CREATE TABLE Pair (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName text, 
            secondName text, 
            timestamp text
            )`,
  (runSqlError) => {
    if (runSqlError) return;

    const insert = 'INSERT INTO Pair (firstName, secondName, timestamp) VALUES (?,?,?)';

    db.run(insert, ['Олег', 'Настя', new Date()]);
  });
});


module.exports = db;
