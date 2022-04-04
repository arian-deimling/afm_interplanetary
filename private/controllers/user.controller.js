

const bcrypt = require('bcrypt');
const session = require("express-session");
const util = require('util');

const { saltRounds } = require('../config/hash.config');
const { usernameRegex, passwordRegex, securityQuestionAnswerRegex } = require('../../public/static/config/validation.config.js');
const db = require('../models');
const res = require('express/lib/response');

const User = db.user;
const SecurityQuestion = db.security_question;

const login = async (req, res) => {

  if (!req.body.username) {
    res.status(400).send({
      what: 'username',
      message: 'Username is required.',
    });
    return;
  }
  if (!req.body.password) {
    res.status(400).send({
      what: 'password',
      message: 'Password is required.',
    });
    return;
  }

  const userLogin = {
    username: req.body.username,
    password: req.body.password,
  };

  let users;

  // get users with matching username from the users table in the db
  try {
    users = await User.findAll({ where: { username: userLogin.username, }, });

  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  if (users.length === 0) {
    res.status(400).send({
      what: 'username',
      message: 'User does not exist.',
    });
    return;
  }

  let passwordCompare;

  try {
    passwordCompare = await new Promise((resolve, reject) => {
      bcrypt.compare(userLogin.password, users[0].dataValues.password, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });

  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  if (passwordCompare === true) {
    req.session.username = userLogin.username;
    res.sendStatus(200);
    return;
  } else {
    res.status(400).send({
      what: 'password',
      message: 'Password is incorrect.',
    });
    return;
  }
};

const create = async (req, res) => {

  SECURITY_QUESTION_ID_MIN = 1;
  SECURITY_QUESTION_ID_MAX = await SecurityQuestion.max('id');

  if (!req.body.username) {
    res.status(400).send({
      what: 'username',
      message: 'Username is required.',
    });
    return;
  } else if (!usernameRegex.test(req.body.username)) {
    res.status(400).send({
      what: 'username',
      message: 'Username is invalid.',
    });
    return;
  }

  if (!req.body.password) {
    res.status(400).send({
      what: 'password',
      message: 'Password is required.',
    });
    return;
  } else if (!passwordRegex.test(req.body.password)) {
    res.status(400).send({
      what: 'password',
      message: 'Password is invalid.',
    });
    return;
  }

  if (!req.body.pass_verify) {
    res.status(400).send({
      what: 'pass_verify',
      message: 'Password Confirmation is required.',
    });
    return;
  } else if (req.body.pass_verify !== req.body.password) {
    res.status(400).send({
      what: 'pass_verify',
      message: 'Password Confirmation is invalid.',
    });
    return;
  }
  
  if (!req.body.security_question_id) {
    res.status(400).send({
      what: 'security_question_id',
      message: 'Security Question is required.',
    });
    return;
  } else if (!(req.body.security_question_id >= SECURITY_QUESTION_ID_MIN  && req.body.security_question_id <= SECURITY_QUESTION_ID_MAX)) {
    res.status(400).send({
      what: 'security_question_id',
      message: 'Security Question is invalid.',
    });
    return;
  }

  if (!req.body.security_question_answer) {
    res.status(400).send({
      what: 'security_question_answer',
      message: 'Security Question Answer is required.',
    });
    return;
  } else if (!securityQuestionAnswerRegex.test(req.body.username)) {
    res.status(400).send({
      what: 'security_question_answer',
      message: 'Security Question Answer is invalid.',
    });
    return;
  }

  const newUser = {
    username: req.body.username,
    password: req.body.password,
    security_question_id: req.body.security_question_id,
    security_question_answer: req.body.security_question_answer,
  };

  /**
   * Steps for registering a user:
   *  1. salt the password provided by the user
   *  2. salt the security question answer provided by the user
   *  3. add the new user to the db
   */
  bcrypt.hash(newUser.password, saltRounds, (err, hash) => {
    // if an error occurs while hashing the password send an error message
    // to the client
    if (err) {
      console.log(err.message);
      res.sendStatus(500);
      return;
    }
    // update the user password to the hashed password value
    newUser.password = hash;

    bcrypt.hash(newUser.security_question_answer, saltRounds, (err, hash) => {
      // if an error occurs while hashing the security question answer send an
      // error message to the client
      if (err) {
        console.log(err.message);
        res.sendStatus(500);
        return;
      }
      // update the user security question to the hashed value
      newUser.security_question_answer = hash;

      // attempt to create the new user in the database
      User.create(newUser)

      // if the user is create successfully
      .then(data => {
        res.sendStatus(200);
      })

      // if an error occurs creating the user
      .catch(err => {

        // if the username already exists, send an appropriate error message
        if (err.name === 'SequelizeUniqueConstraintError') {
          res.status(400).send({
            what: 'username',
            message: 'Username is already taken, please try a different one.',
          });
          return;
        }

        // if an unknown error occurs, log the error message
        console.log(err.message)
        res.sendStatus(500);
      });
    });
  });
};


const checkLogin = (req, res) => {
  // send OK status if there is a valid, active session; otherwise 400
  if (req.session.username) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400)
  }
};

const logout = (req, res) => {
  if (req.session.username) {
    req.session.username = '';
    res.redirect('/');
  } else {
    res.redirect('/');
  }
};

const findUser = async (req, res) => {

  if (!req.body.username) {
    res.status(400).send({
      what: 'username',
      message: 'Username is required.',
    });
    return;
  }

  const userLogin = {
    username: req.body.username,
  };

  let users;

  // get users with matching username from the users table in the db
  try {
    users = await User.findAll({ where: { username: userLogin.username, }, });

  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  if (users.length === 0) {
    res.status(400).send({
      what: 'username',
      message: 'User does not exist.',
    });
    return;
  }

  // TODO(AD) - add try/catch
  const question = await SecurityQuestion.findAll({ where: { id: users[0].dataValues.security_question_id } });

  res.status(200).send({
    security_question: question[0].dataValues.question,
    security_question_id: users[0].dataValues.security_question_id,
  });
};

const resetPassword = async (req, res) => {

  if (!req.body.username) {
    res.status(400).send({
      what: 'username',
      message: 'Username is required.',
    });
    return;
  }

  if (!req.body.security_question_answer) {
    res.status(400).send({
      what: 'security_question_answer',
      message: 'Security Question Answer is required.',
    });
    return;
  }

  if (!req.body.password) {
    res.status(400).send({
      what: 'password',
      message: 'Password is required.',
    });
    return;
  } else if (!passwordRegex.test(req.body.password)) {
    res.status(400).send({
      what: 'password',
      message: 'Password is invalid.',
    });
    return;
  }

  if (!req.body.pass_verify) {
    res.status(400).send({
      what: 'pass_verify',
      message: 'Password Confirmation is required.',
    });
    return;
  } else if (req.body.pass_verify !== req.body.password) {
    res.status(400).send({
      what: 'pass_verify',
      message: 'Password Confirmation is invalid.',
    });
    return;
  }

  // get users with matching username from the users table in the db
  let users;
  try {
    users = await User.findAll({ where: { username: req.body.username, }, });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // if user does not exist return an error message
  if (users.length === 0) {
    res.status(400).send({
      what: 'username',
      message: 'User does not exist.',
    });
    return;
  }

  // compare security question answer to value stored in db
  const bcryptCompare = util.promisify(bcrypt.compare);
  const securityQuestionAnswer = req.body.security_question_answer;
  const securityQuestionAnswerHash = users[0].dataValues.security_question_answer;
  let securityQuestionAnswerCompare;
  try {
    securityQuestionAnswerCompare = await bcryptCompare(securityQuestionAnswer, securityQuestionAnswerHash);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // if security question answer was incorrect, send a message to the client
  if (!securityQuestionAnswerCompare) {
    res.status(400).send({
      what: 'security_question_answer',
      message: 'Security question answer is incorrect.',
    });
  }

  // hash the users new password
  const bcryptHash = util.promisify(bcrypt.hash);
  const newPassword = req.body.password;
  let newPasswordHash;
  try {
    newPasswordHash = await bcryptHash(newPassword, saltRounds);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // update the user password
  try {
    await User.update(
      { password: newPasswordHash },
      { where: { username: req.body.username } }
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
};

const user_controller = {};
user_controller.login = login;
user_controller.create = create;
user_controller.checkLogin = checkLogin;
user_controller.logout = logout;
user_controller.findUser = findUser;
user_controller.resetPassword = resetPassword;

module.exports = user_controller;
