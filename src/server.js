// Create express app
const express = require('express');
const bodyParser = require('body-parser');

const db = require('./database.js');

const app = express();

// Server port
const HTTP_PORT = 8000;
// Start server
app.listen(HTTP_PORT, () => {
  console.log(`Server running on http://localhost:${HTTP_PORT}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Ok' });
});

// Insert here other API endpoints

app.get('/api/pairs-all', (req, res) => {
  const sql = 'select * from Pair';
  const params = [];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });

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
      res.status(400).json({ error: err.message });

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
  const { firstName, secondName, timestamp } = req.body;

  if (!firstName) {
    errors.push('No password specified');
  }

  if (!secondName) {
    errors.push('No email specified');
  }

  if (!timestamp) {
    errors.push('No timestamp specified');
  }

  if (errors.length > 0) {
    res.status(400).json({ error: errors.join(',') });

    return;
  }

  const sql = 'INSERT INTO Pair (firstName, secondName, timestamp) VALUES (?,?,?)';
  const params = [firstName, secondName, timestamp];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });

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
  const { firstName, secondName, timestamp } = req.body;

  db.run(
    `UPDATE Pair set 
           firstName = COALESCE(?, firstName), 
           secondName = COALESCE(?, secondName), 
           timestamp = COALESCE(?, timestamp) 
           WHERE id = ?`,
    [firstName, secondName, timestamp, req.params.id],
    function (err) {
      if (err) {
        res.status(400).json({ error: res.message });

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

app.delete('/api/pair/:id', (req, res) => {
  db.run(
    'DELETE FROM Pair WHERE id = ?',
    req.params.id,
    function (err) {
      if (err) {
        res.status(400).json({ error: res.message });

        return;
      }

      res.json({ message: 'deleted', changes: this.changes });
    },
  );
});

// Default response for any other request
app.use((req, res) => {
  res.status(404);
});
