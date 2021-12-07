const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const methodeOverride = require('method-override');
const { findUserByEmail, generateRandomString, generateRandomUserID, urlsForUserID } = require('./helpers');

const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(methodeOverride('_method'));

app.set('view engine', 'ejs');

/* --------TEST DATABASE--------- */

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: '322' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: '921' }
};

const users = {
  '322': {
    id: '322',
    email: 'a@gmail.com',
    password: '$2b$10$k4U0SIjW6p.DqahikvUcEewpcJ0c.WtkUGwD7vG2eheR1gdpLzqja'
    // user password : 123
  },

  '921': {
    id: '921',
    email: 'b@gmail.com',
    password: '$2b$10$JUDRsJ4L6IsM5P.l/p5H5uoHYKQzBBS/hUnMG5OrizsIIqWAWF54m'
    // user password: abc
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
    user: users[userID],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    urls: urlDatabase,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userID],
  };

  console.log(users[userID]);
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
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

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`urls/${shortURL}`);
});

app.delete('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;

  if (userID !== urlDatabase[shortURL].userID) {
    let errMsg = "You don't have permission to delete this URL";
    return res.status(401).render("urls_index", { errMsg });
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.put('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;

  urlDatabase[shortURL].longURL = updatedLongURL;

  res.redirect('/urls/');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  let errMsg = '';
  
  if (!email || !password) {
    errMsg = 'Email or Password cannot be blank.';
    return res.status(400).render('login', { errMsg });
  }
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    errMsg = 'Incorrect Email or Password.';
    return res.status(400).render('login', { errMsg });
  }

  // eslint-disable-next-line camelcase
  req.session.user_id = user.id;
  res.redirect('/urls');
});


app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomUserID(3);
  const user = findUserByEmail(email, users);
  let errMsg = '';

  if (!email || !password) {
    errMsg = 'Email or Password cannot be blank.';
    return res.status(400).render('register', { errMsg, user });
  }

  if (user.email === email) {
    errMsg = 'There is existing account associated with the email.';
    return res.status(400).render('register', { errMsg, user });
  }

  users[id] = { id, email, hashedPassword };

  // eslint-disable-next-line camelcase
  req.session.user_id = id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});