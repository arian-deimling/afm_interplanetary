const express = require('express');
const { check, body, validationResult } = require('express-validator');
const path = require('path');
const mysql = require('mysql');
var bodyParser = require('body-parser')

// TODO - dont use root, dont use plaintext credentials
// set up DB connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'afm_interplanetary',
});
connection.connect((err) => {
    if (err) {
        throw err;
    }
});

const app = express();
const port = 80;

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, '/public/static')));

app.get(['/', '/index', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get(['/signup', '/signup.html'], (req, res) => {
    res.sendFile(path.join(__dirname, '/public/signup.html'));
});

app.get(['/login', '/login.html'], (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
});

app.post('/loginuser',
    check('username').exists().bail().trim().toLowerCase()
        .not().isEmpty()
        .withMessage('Required field.'),
    check('password').exists().bail().trim()
        .not().isEmpty()
        .withMessage('Required field.'),
    (req, res) => {
        const validation = validationResult(req);
        const hasErrors = !validation.isEmpty();
        // console.log(validation.errors);
        // invalid field values - send error messages for client to report
        if (hasErrors) {
            res.status(400);
            res.send(JSON.stringify(validation.errors));
            return;
        }
        const username = req.body.username;
        let password = '';
        const sql = `SELECT username, password FROM user WHERE username = '${username}'`
        connection.query(sql, (err, queryRes) => {
            if (err) {
                // db error - should never happen
                res.sendStatus(500);
                throw err; // TODO - maybe a bad idea
            }
            // if the user exists, retrieve their password
            ////////////////////////////////////////////////////////////// TODO /////////
        });
});

const MIN_USER = 5;
const MIN_PASS = 5;
app.post('/adduser', 
    // ensure that length is not greater than 32 and add an error message for client
    check('username').exists().bail().trim().toLowerCase()
        .not().isEmpty()
        .withMessage('Required field.')
        .bail()
        .isLength({min: MIN_USER})
        .withMessage(`Username must be at least ${MIN_USER} characters long.`)
        .bail()
        .isAlphanumeric()
        .withMessage('Username must contain only letters or numbers.')
        .bail(),
    body('password').exists().bail()
        .not().isEmpty()
        .withMessage('Required field.')
        .bail()
        .isStrongPassword({
            minLength: MIN_PASS,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0
        }).withMessage(
            `Password must be at least ${MIN_PASS} characters long and contain `
            + 'at least 1 uppercase letter, 1 lowercase letter, and one number.'
        ),
    body('pass-verify').exists().bail()
        .not().isEmpty()
        .withMessage('Required field.')
        .bail()
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    (req, res) => {
        // console.log(req.body);
        const validation = validationResult(req);
        const hasErrors = !validation.isEmpty();
        // console.log(validation.errors);
        // invalid field values - send error messages for client to report
        if (hasErrors) {
            res.status(400);
            res.send(JSON.stringify(validation.errors));
            return;
        }
        // TODO - sanitize to ensure that SQL commands cannot be run using this
        const sql = `INSERT INTO user (username, password) VALUES ('${req.body.username}', '${req.body.password}')`;
        // console.log(sql);
        connection.query(sql, (err, queryRes) => {
            if (err) {
                // db error - client should report duplicate username (?)
                // TODO - could anything else cause this (need to send response body)?
                res.sendStatus(409);
                // console.log(err);
                return;
            }
            // success - client should go to login page
            res.sendStatus(200);
        });

});

app.listen(port, () =>{
    console.log(`Example app listening on port ${port}`);
});

// TEST CODE

// connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
//     if (err) throw err
//     console.log('The solution is ', rows[0].solution);
// })

// END TEST CODE
