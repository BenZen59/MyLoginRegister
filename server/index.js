const express = require('express');
const mysql2 = require('mysql2');

const app = express();
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const bcrypt = require('bcrypt');

const saltRounds = 10;

const jwt = require('jsonwebtoken');

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

const verifyJWT = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    res.send('Yo, we need a token, please give it to us next time!');
  } else {
    jwt.verify(token, 'jwtSecret', (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: 'You failed to authentificate' });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

app.get('/isUserAuth', verifyJWT, (req, res) => {
  res.send('Yo, you are authenticated Congrats!');
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
            const { id } = result[0].id;
            const token = jwt.sign({ id }, 'jwtSecret', {
              expiresIn: 300,
            });
            req.session.user = result;
            res.json({ auth: true, token, result });
          } else {
            res.json({
              auth: false,
              message: 'Wrong username/password combination',
            });
          }
        });
      } else {
        res.json({ auth: false, message: 'No user exists' });
      }
    }
  );
});

app.listen(3001, () => {
  console.log('running server');
});
