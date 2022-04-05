const express = require('express');
const path = require('path');
const mysql = require('mysql');
const cookieParser = require("cookie-parser");
const session = require("express-session");

const db = require('./private/models/index');
const sessionConfig = require('./private/config/session.config');
const SessionStore = require("express-session-sequelize")(session.Store);
const app = express();

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', './private/views');
app.set('view engine', 'ejs');

db.connection.sync().then(() => {});

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

// serves static files
app.use(express.static(path.join(__dirname, '/public/static')));

// page aliases redirect only
app.get(['/index', '/index.html'], (req, res) => {
    res.redirect('/');
});
app.get('/about.html', (req, res) => {
    res.redirect('/about');
});
app.get('/signup.html', (req, res) => {
    res.redirect('/signup');
});
app.get('/login.html', (req, res) => {
    res.redirect('/login');
});
app.get('/reset.html', (req, res) => {
    res.redirect('/reset');
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

app.listen(PORT, () =>{
    console.log(`Example app listening on port ${PORT}`);
});
