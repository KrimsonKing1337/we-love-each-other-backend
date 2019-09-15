const { v4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const dbAsync = require('./utils/dbAsync');

const DB_SOURCE = 'db.sqlite';

const db = new sqlite3.Database(DB_SOURCE, dataBaseError => {
  if (dataBaseError) {
    // Cannot open database
    console.error(dataBaseError.message);

    throw dataBaseError;
  }

  console.log('Connected to the SQLite database.');

  db.run(`CREATE TABLE pairs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name varchar, 
            second_name varchar, 
            date date,
            img_src varchar
            )`,
  runSqlError => {
    if (runSqlError) return;

    const sql = 'INSERT INTO pairs (first_name, second_name, date, img_src) VALUES (?,?,?,?)';

    db.run(sql, ['Олег', 'Настя', '2019-07-24', null]);
  });

  db.run('CREATE TABLE img_last_folder (path varchar)',
    runSqlError => {
      if (runSqlError) return;

      const sql = 'INSERT INTO img_last_folder (path) VALUES (?)';

      db.run(sql, [v4()]);
    });
});

module.exports = dbAsync(db);
