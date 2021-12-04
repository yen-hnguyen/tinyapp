const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;

const { findUserByEmail, generateRandomString, generateRandomUserID, urlsForUserID } = require('./helpers');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: '100' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: '200' }
};

const users = {
  '100': {
    id: '100',
    email: 'a@email.com',
    password: '123'
  },
  '200': {
    id: '200',
    email: 'b@email.com',
    password: '234'
  }
};


/* --------GET ROUTE--------- */
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUserID(userID, urlDatabase);

  const templateVars = {
    urls: userURLs,
    user: users[userID]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!users[req.body.id]) {
    return res.status(400).send("You need to login or register to create new URL");
  }
  const templateVars = { user: req.session['user'] };

  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUserID(userID, urlDatabase);

  const templateVars = {
    urls: userURLs,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: req.session.user_id
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id
  };
  res.render('register', templateVars);
});


/* --------POST ROUTE--------- */
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;

  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You don't have permission to delete this URL");
  }
  delete urlDatabase[shortURL];
  
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send('Email or password cannot be blank.');
  }

  const user = findUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, hashedPassword)) {
    return res.status(403).send('Invalid email or password');
  }
  console.log(hashedPassword);
  // eslint-disable-next-line camelcase
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomUserID(3);

  if (!email || !password) {
    return res.status(400).send('Email or password cannot be blank.');
  }

  const user = findUserByEmail(email, users);

  if (user) {
    return res.status(400).send('There is existing account associated with the email.');
  }

  users[id] = { id, email, hashedPassword };

  // eslint-disable-next-line camelcase
  req.session.user_id = id;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});