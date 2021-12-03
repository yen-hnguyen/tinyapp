const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

app.set('view engine', 'ejs');

// HELPER FUNCTIONS
const generateRandomString = function() {
  const randomNumber = Math.random().toString(36).substr(2, 6);
  return randomNumber;
};

const generateRandomUserID = function(length) {
  let randomID = Math.floor(Math.random() * 1000);

  while (randomID.toString().length < length) {
    randomID = '0' + randomID;
  }

  return randomID;
};

const findUserByEmail = (email, users) => {
  for (const userID in users) {
    const user = users[userID];

    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: req.cookies['user'] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies['user_id']]
  };
  res.render('urls_show', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render('register', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
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

  if (!email || ! password) {
    return res.status(400).send('Email or password cannot be blank.');
  }

  const user = findUserByEmail(email, users);

  if (!user) {
    return res.status(403).send('Invalid email.');
  }


  if (password !== user.password) {
    return res.status(403).send('Incorrect password.');
  }

  res.cookie('user_id', user.id),
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomUserID(3);

  if (!email || ! password) {
    return res.status(400).send('Email or password cannot be blank.');
  }

  const user = findUserByEmail(email, users);

  if (user) {
    return res.status(400).send('There is existing account associated with the email.');
  }

  users[id] = { id, email, password };

  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});