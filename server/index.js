const express = require('express');
const mysql2 = require('mysql2');

const app = express();
const cors = require('cors');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_SCHEMA } = process.env;

app.use(cors());
app.use(express.json());
const db = mysql2.createConnection({
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  database: DB_SCHEMA,
});

app.post('/register', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  db.query(
    'INSERT INTO users(username, password) VALUES (?,?)',
    [username, password],
    (err, result) => {
      res.send(err);
    }
  );
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, result) => {
      if (err) {
        res.send(err);
      } else if (result.length > 0) {
        res.send(result);
      } else {
        res.send({ message: 'Wrong username/password combination' });
      }
    }
  );
});

app.listen(3001, () => {
  console.log('running server');
});
