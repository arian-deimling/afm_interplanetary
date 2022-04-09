'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const minify = require('express-minify');
const session = require('express-session');

const db = require('./private/models/index');
const sessionConfig = require('./private/config/session.config');
const SessionStore = require('express-session-sequelize')(session.Store);
const app = express();

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true, }));

// app.use(minify());
minify();

app.set('views', './private/views');
app.set('view engine', 'ejs');

db.connection.sync();

const sessionStore = new SessionStore({
  db: db.connection,
});

app.use(session({
  secret: sessionConfig.secret,
  saveUninitialized: sessionConfig.saveUninitialized,
  cookie: sessionConfig.cookie,
  resave: sessionConfig.resave,
  store: sessionStore,
}));

// api routes
require('./private/routes/security_questions.routes')(app);
require('./private/routes/user.routes')(app);
require('./private/routes/reservation.routes')(app);

// serves static files
app.use(express.static(path.join(__dirname, '/public')));

// page aliases redirect only
app.get([ '/index', '/index.html', ], (req, res) => res.redirect('/'));
app.get('/about.html', (_, res) => res.redirect('/about'));
app.get('/signup.html', (_, res) => res.redirect('/signup'));
app.get('/login.html', (_, res) => res.redirect('/login'));
app.get('/reset.html', (_, res) => res.redirect('/reset'));
app.get('/reservation.html', (_, res) => res.redirect('/reservation'));
app.get('/reservation/view.html', (_, res) => res.redirect('/reservation/view'));

// serve pages
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/about', (req, res) => {
  res.render('about');
});
app.get('/signup', (req, res) => {
  // if the user is logged in, redirect them to the home page
  if (req.session.userID) {
    res.redirect('/');
    return;
  }
  res.render('signup');
});
app.get('/login', (req, res) => {
  // if the user is logged in, redirect them to the home page
  if (req.session.userID) {
    res.redirect('/');
    return;
  }
  res.render('login');
});
app.get('/reset', (req, res) => {
  // if the user is logged in, redirect them to the home page
  if (req.session.userID) {
    res.redirect('/');
    return;
  }
  res.render('reset');
});
app.get('/reservation', (req, res) => {
  // if the user is not logged in, redirect them to the home page
  if (!req.session.userID) {
    res.redirect('/');
    return;
  }
  res.render('reservation');
});
app.get('/reservation/view', (req, res) => {
  // if the user is not logged in, redirect them to the home page
  if (!req.session.userID) {
    res.redirect('/');
    return;
  }
  res.render('viewreservation');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
