// Create express app
const express = require('express');
const bodyParser = require('body-parser');
const { v4 } = require('uuid');
const fileUpload = require('express-fileupload');
const appRoot = require('./utils/appRoot.js');

const db = require('./database.js');
const fileAsync = require('./utils/fileAsync.js');
const getImgLastFolder = require('./utils/imgLastFolder.js');

const app = express();

// Server port
const HTTP_PORT = 8000;
// Start server
app.listen(HTTP_PORT, () => {
  console.log(`Server running on http://localhost:${HTTP_PORT}`);
});

app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true,
  parameterLimit: 1000000,
}));

app.use(bodyParser.json({
  limit: '10mb',
  extended: true,
}));

app.use(fileUpload({}));

app.use('/uploads', express.static(`${appRoot}/uploads`));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Ok',
  });
});

// Insert here other API endpoints

app.get('/api/pairs-all', (req, res) => {
  const sql = 'select * from pairs';
  const params = [];

  db.allAsync(sql, params)
    .then(rows => {
      res.json({
        message: 'success',
        data: rows,
      });
    })
    .catch(err => {
      res.status(400).json({
        error: err.message,
      });
    });
});

app.get('/api/pair/:id', (req, res) => {
  const sql = 'SELECT * FROM pairs WHERE id = ?';
  const params = [req.params.id];

  db.getAsync(sql, params)
    .then(rows => {
      res.json({
        message: 'success',
        data: rows,
      });
    })
    .catch(err => {
      res.status(400).json({
        error: err.message,
      });
    });
});

app.post('/api/pair/', (req, res) => {
  const errors = [];
  const { firstName, secondName, date } = req.body;

  if (!firstName) {
    errors.push('No password specified');
  }

  if (!secondName) {
    errors.push('No email specified');
  }

  if (!date) {
    errors.push('No date specified');
  }

  const params = [firstName, secondName, date];

  for (let i = 0; i < params.length; i += 1) {
    const paramCur = params[i];

    if (paramCur.length > 255) {
      errors.push('Request is too large');

      break;
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: errors.join(','),
    });

    return;
  }

  const sql = 'INSERT INTO pairs (first_name, second_name, date, img_src) VALUES (?,?,?,?)';

  db.runAsync(sql, [...params, null])
    .then(result => {
      res.json({
        message: 'success',
        data: req.body,
        id: result.lastID,
      });
    })
    .catch(() => {
      res.status(400).json({
        error: res.message,
      });
    });
});

app.patch('/api/pair/:id', (req, res) => {
  const {
    firstName,
    secondName,
    date,
    imgSrc,
  } = req.body;

  const params = [firstName, secondName, date, imgSrc];

  for (let i = 0; i < params.length; i += 1) {
    const paramCur = params[i];

    if (paramCur.length > 255) {
      res.status(400).json({
        error: 'Request is too large',
      });

      return;
    }
  }

  const sql = `UPDATE pairs set 
           first_name = COALESCE(?, first_name), 
           second_name = COALESCE(?, second_name), 
           date = COALESCE(?, date),
           img_src = COALESCE(?, img_src)
           WHERE id = ?`;

  db.runAsync(sql, [...params, req.params.id])
    .then(result => {
      res.json({
        message: 'success',
        data: req.body,
        changes: result.changes,
      });
    })
    .catch(() => {
      res.status(400).json({
        error: res.message,
      });
    });
});

app.put('/api/pair/:id', async (req, res) => {
  const { files } = req;

  if (Object.keys(files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let imgLastFolder = '';

  try {
    imgLastFolder = await getImgLastFolder();
  } catch (err) {
    console.error(err);

    return res.status(500).send(err);
  }

  let { file } = files;
  file = fileAsync(file);
  const { name } = file;
  const ext = name.split('.').pop();
  const uniqueKey = v4();
  const filePath = `uploads/img/${imgLastFolder}/${uniqueKey}.${ext}`;

  try {
    await file.mvAsync(`${appRoot}/${filePath}`);
  } catch (fileMvErr) {
    console.error('fileMvErr', fileMvErr);

    return res.status(500).send(fileMvErr);
  }

  const sql = `UPDATE pairs set 
           img_src = COALESCE(?, img_src)
           WHERE id = ?`;

  db.runAsync(sql, [`/${filePath}`, req.params.id])
    .then(result => {
      res.json({
        message: 'success',
        data: req.body,
        changes: result.changes,
      });
    })
    .catch(() => {
      res.status(400).json({
        error: res.message,
      });
    });
});

app.delete('/api/pair/:id', (req, res) => {
  db.runAsync('DELETE FROM pairs WHERE id = ?', req.params.id)
    .then(result => {
      res.json({
        message: 'deleted',
        changes: result.changes,
      });
    })
    .catch(() => {
      res.status(400).json({
        error: res.message,
      });
    });
});

// Default response for any other request
app.use((req, res) => {
  res.status(404);
});
