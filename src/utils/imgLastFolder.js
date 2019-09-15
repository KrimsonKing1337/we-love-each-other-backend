const fs = require('fs');
const { v4 } = require('uuid');
const appRoot = require('./appRoot.js');
const db = require('../database.js');

function readdirAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function mkdirAsync(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve(path);
      }
    });
  });
}

async function getImgLastFolder(disableCreatingNewFolder = false) {
  let imgLastFolder = '';

  try {
    imgLastFolder = await db.getAsync('SELECT * FROM img_last_folder');
  } catch (err) {
    console.error(err);

    return err;
  }

  if (disableCreatingNewFolder) {
    return imgLastFolder.path;
  }

  return readdirAsync(`${appRoot}/uploads/img/${imgLastFolder.path}`)
    .then(files => {
      const newPath = `${appRoot}/uploads/img/${v4()}`;

      if (files.length >= 500) {
        return mkdirAsync(newPath)
          .then(path => db.runAsync('UPDATE img_last_folder set path = COALESCE(?, path)', [path]));
      }

      return imgLastFolder.path;
    })
    .catch(err => {
      throw err;
    });
}

module.exports = getImgLastFolder;
