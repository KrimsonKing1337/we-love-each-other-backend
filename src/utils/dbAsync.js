function dbAsync(db) {
  // eslint-disable-next-line no-param-reassign
  db.getAsync = function (sql, params) {
    const self = this;

    return new Promise(((resolve, reject) => {
      self.get(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    }));
  };

  // eslint-disable-next-line no-param-reassign
  db.runAsync = function (sql, params) {
    const self = this;

    return new Promise(((resolve, reject) => {
      self.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    }));
  };

  // eslint-disable-next-line no-param-reassign
  db.allAsync = function (sql, params) {
    const self = this;

    return new Promise(((resolve, reject) => {
      self.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    }));
  };

  return db;
}

module.exports = dbAsync;
