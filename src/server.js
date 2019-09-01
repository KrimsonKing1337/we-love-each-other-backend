// Create express app
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v5');
const fileUpload = require('express-fileupload');
const appRoot = require('./appRoot.js');

const db = require('./database.js');

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
  const sql = 'select * from Pair';
  const params = [];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({
        error: err.message,
      });

      return;
    }

    res.json({
      message: 'success',
      data: rows,
    });
  });
});

app.get('/api/pair/:id', (req, res) => {
  const sql = 'select * from Pair where id = ?';
  const params = [req.params.id];

  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({
        error: err.message,
      });

      return;
    }

    res.json({
      message: 'success',
      data: row,
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

  const sql = 'INSERT INTO Pair (firstName, secondName, date, imgSrc) VALUES (?,?,?,?)';

  db.run(sql, [...params, null], function (err) {
    if (err) {
      res.status(400).json({
        error: err.message,
      });

      return;
    }

    res.json({
      message: 'success',
      data: req.body,
      id: this.lastID,
    });
  });
});

app.patch('/api/pair/:id', (req, res) => {
  const {
    firstName, secondName, date, imgSrc,
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

  db.run(
    `UPDATE Pair set 
           firstName = COALESCE(?, firstName), 
           secondName = COALESCE(?, secondName), 
           date = COALESCE(?, date),
           imgSrc = COALESCE(?, imgSrc)
           WHERE id = ?`,
    [...params, req.params.id],
    function (err) {
      if (err) {
        res.status(400).json({
          error: res.message,
        });

        return;
      }

      res.json({
        message: 'success',
        data: req.body,
        changes: this.changes,
      });
    },
  );
});

app.put('/api/pair/:id', (req, res) => {
  const { files } = req;

  if (Object.keys(files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const { file } = files;
  const { name } = file;

  file.mv(`${appRoot}/uploads/img/${name}`, (fileMvErr) => {
    if (fileMvErr) {
      console.error(fileMvErr);

      return res.status(500).send(fileMvErr);
    }

    db.run(
      `UPDATE Pair set 
           imgSrc = COALESCE(?, imgSrc)
           WHERE id = ?`,
      [`/uploads/img/${name}`, req.params.id],
      function (err) {
        if (err) {
          res.status(400).json({
            error: res.message,
          });

          return;
        }

        res.json({
          message: 'success',
          data: req.body,
          changes: this.changes,
        });
      },
    );
  });
});

app.delete('/api/pair/:id', (req, res) => {
  db.run(
    'DELETE FROM Pair WHERE id = ?',
    req.params.id,
    function (err) {
      if (err) {
        res.status(400).json({
          error: res.message,
        });

        return;
      }

      res.json({
        message: 'deleted',
        changes: this.changes,
      });
    },
  );
});

// Default response for any other request
app.use((req, res) => {
  res.status(404);
});
