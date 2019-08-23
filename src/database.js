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
            date text
            )`,
  (runSqlError) => {
    if (runSqlError) return;

    const insert = 'INSERT INTO Pair (firstName, secondName, date) VALUES (?,?,?)';

    db.run(insert, ['Олег', 'Настя', '2019-07-24']);
  });
});


module.exports = db;
