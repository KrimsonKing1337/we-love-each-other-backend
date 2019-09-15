function fileAsync(file) {
  // eslint-disable-next-line no-param-reassign
  file.mvAsync = function (filePath) {
    const self = this;

    return new Promise(((resolve, reject) => {
      self.mv(filePath, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }));
  };

  return file;
}

module.exports = fileAsync;
