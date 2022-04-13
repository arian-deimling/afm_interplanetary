import 'dotenv/config';

import path, { dirname } from 'path';

import db from './private/models/index.js';
import express from 'express';
import { fileURLToPath } from 'url';
import minify from 'express-minify';
import reservationRoutes from './private/routes/reservation.routes.js';
import session from 'express-session';
import sessionConfig from './private/config/session.config.js';
import sessionSequelize from 'express-session-sequelize';
import userRoutes from './private/routes/user.routes.js';


const PORT = 8080;
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

const app = express();
const SessionStore = sessionSequelize(session.Store);

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
userRoutes(app);
reservationRoutes(app);

// serves static files
app.use(express.static(path.join(__dirname, '/public')));

// page aliases redirect only
app.get([ '/index', '/index.html', ], (_, res) => res.redirect('/'));
app.get('/about.html', (_, res) => res.redirect('/about'));
app.get('/signup.html', (_, res) => res.redirect('/signup'));
app.get('/login.html', (_, res) => res.redirect('/login'));
app.get('/reset.html', (_, res) => res.redirect('/reset'));
app.get('/reservation.html', (_, res) => res.redirect('/reservation'));
app.get('/reservation/view.html', (_, res) => {
  res.redirect('/reservation/view');
});

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
app.get('/500', (req, res) => {
  res.status(500).render('500');
});
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
