const express = require('express');
const mysql2 = require('mysql2');

const app = express();
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const bcrypt = require('bcrypt');

const saltRounds = 10;

require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_SCHEMA } = process.env;

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: 'userId',
    secret: 'subscribe',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);
const db = mysql2.createConnection({
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  database: DB_SCHEMA,
});

app.post('/register', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    db.query(
      'INSERT INTO users(username, password) VALUES (?,?)',
      [username, hash],
      (err, result) => {
        res.send(err);
      }
    );
  });
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ?',
    username,
    (err, result) => {
      if (err) {
        res.send(err);
      } else if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.user = result;
            res.send(result);
          } else {
            res.send({ message: 'Wrong username/password combination' });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
});

app.listen(3001, () => {
  console.log('running server');
});
