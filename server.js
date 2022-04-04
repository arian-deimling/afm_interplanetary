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

// serve main page
app.get(['/', '/index', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get(['/signup', '/signup.html'], (req, res) => {
    // if the user is logged in, redirect them to the home page
    if (req.session.username) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, '/public/signup.html'));
});

app.get(['/login', '/login.html'], (req, res) => {
    // if the user is logged in, redirect them to the home page
    if (req.session.username) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, '/public/login.html'));
});

app.get(['/reset', '/reset.html'], (req, res) => {
    // if the user is logged in, redirect them to the home page
    if (req.session.username) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, '/public/reset.html'));
});

app.listen(PORT, () =>{
    console.log(`Example app listening on port ${PORT}`);
});
