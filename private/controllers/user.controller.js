const util = require('util');
const bcrypt = require('bcrypt');

const db = require('../models');
const { saltRounds } = require('../config/hash.config');
const { usernameRegex, passwordRegex, securityQuestionAnswerRegex } = 
  require('../../public/scripts/config/validation.config');

const User = db.user;
const SecurityQuestion = db.security_question;

// promisify the bcrypt.compare() and bcrypt.hash() methods
const bcryptCompare = util.promisify(bcrypt.compare);
const bcryptHash = util.promisify(bcrypt.hash);

// controller for login requests from the client
const login = async (req, res) => {
  // make sure that the request contains username and password
  const clientCredentials = req.body;
  if (!clientCredentials.username) {
    res.status(400).send({
      what: 'username',
      message: 'Username is required.',
    });
    return;
  }
  if (!clientCredentials.password) {
    res.status(400).send({
      what: 'password',
      message: 'Password is required.',
    });
    return;
  }

  // get users with matching username from the users table in the db
  let usersQueryResult;
  try {
    usersQueryResult = await User.findAll({
      where: { username: clientCredentials.username },
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // if no users match respond with an error message
  if (usersQueryResult.length === 0) {
    res.status(400).send({
      what: 'username',
      message: 'User does not exist.',
    });
    return;
  }

  // compare client login password with stored password for this user
  const storedPassword = usersQueryResult[0].dataValues.password;
  let passwordCompareResult;
  try {
    passwordCompareResult = await bcryptCompare(
      clientCredentials.password, storedPassword
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // if password does not match respond with an error message
  if (passwordCompareResult !== true) {
    res.status(400).send({
      what: 'password',
      message: 'Password is incorrect.',
    });
    return;
  }

  // if login is successful, set session username and send OK status
  req.session.userID = usersQueryResult[0].dataValues.id;
  res.sendStatus(200);
  return;
};

// controller for account creation requests from the client
const create = async (req, res) => {
  // save min and max values for security question ID
  const SECURITY_QUESTION_ID_MIN = 1;
  const SECURITY_QUESTION_ID_MAX = await SecurityQuestion.max('id');

  const clientCredentials = req.body;

  // validate username from client
  if (!clientCredentials.username) {
    res.status(400).send({
      what: 'username',
      message: 'Username is required.',
    });
    return;
  }
  if (!usernameRegex.test(clientCredentials.username)) {
    res.status(400).send({
      what: 'username',
      message: 'Username is invalid.',
    });
    return;
  }

  // validate password from client
  if (!clientCredentials.password) {
    res.status(400).send({
      what: 'password',
      message: 'Password is required.',
    });
    return;
  }
  if (!passwordRegex.test(clientCredentials.password)) {
    res.status(400).send({
      what: 'password',
      message: 'Password is invalid.',
    });
    return;
  }

  // validate password verification field from client
  if (!clientCredentials.pass_verify) {
    res.status(400).send({
      what: 'pass_verify',
      message: 'Password Confirmation is required.',
    });
    return;
  }
  if (clientCredentials.pass_verify !== clientCredentials.password) {
    res.status(400).send({
      what: 'pass_verify',
      message: 'Password Confirmation is invalid.',
    });
    return;
  }
  
  // validate security question ID from client
  if (!clientCredentials.security_question_id) {
    res.status(400).send({
      what: 'security_question_id',
      message: 'Security Question is required.',
    });
    return;
  }
  const validSecurityQuestionId = (
    (clientCredentials.security_question_id >= SECURITY_QUESTION_ID_MIN)
    || (clientCredentials.security_question_id <= SECURITY_QUESTION_ID_MAX)
  );
  if (!validSecurityQuestionId) {
    res.status(400).send({
      what: 'security_question_id',
      message: 'Security Question is invalid.',
    });
    return;
  }

  // validate security question answer from client
  if (!clientCredentials.security_question_answer) {
    res.status(400).send({
      what: 'security_question_answer',
      message: 'Security Question Answer is required.',
    });
    return;
  }
  if (!securityQuestionAnswerRegex.test(clientCredentials.security_question_answer)) {
    res.status(400).send({
      what: 'security_question_answer',
      message: 'Security Question Answer is invalid.',
    });
    return;
  }

  // get users with matching username from the users table in the db
  let usersQueryResult;
  try {
    usersQueryResult = await User.findAll({
      where: { username: clientCredentials.username },
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // if an entry with the same username is found in the db, respond to client
  // with error message
  if (usersQueryResult.length !== 0) {
    res.status(400).send({
      what: 'username',
      message: 'Username is already taken, please try a different one.',
    });
    return;
  }
  
  const newUser = {
    username: clientCredentials.username,
    security_question_id: clientCredentials.security_question_id,
  };

  // hash the client values for password and security question answer
  try {
    newUser.password = await bcryptHash(clientCredentials.password, saltRounds);
    newUser.security_question_answer = await bcryptHash(
      clientCredentials.security_question_answer, saltRounds
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // create a new user with the client input values
  try {
    await User.create(newUser);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // respond to the client with OK
  res.sendStatus(200);
};

// controller to check whether a user is logged in
const checkLogin = async (req, res) => {
  // send OK status if there is a valid, active session; otherwise 400
  if (req.session.userID) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400)
  }
};

// controller to log a user out
const logout = async (req, res) => {
  if (req.session.userID) {
    req.session.userID = 0;
    res.redirect('/');
  } else {
    res.redirect('/');
  }
};

// controller to find user security question to assist with password reset
const findUser = async (req, res) => {

  clientCredentials = req.body;

  // validate username from client
  if (!clientCredentials.username) {
    res.status(400).send({
      what: 'username',
      message: 'Username is required.',
    });
    return;
  }


  // get users with matching username from the users table in the db
  let usersQueryResult;
  try {
    usersQueryResult = await User.findAll({
      where: { username: clientCredentials.username }, 
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // if the user does not exist, respond with an error message
  if (usersQueryResult.length === 0) {
    res.status(400).send({
      what: 'username',
      message: 'User does not exist.',
    });
    return;
  }

  // find the security question for the user
  let questionQueryResult;
  try {
    questionQueryResult = await SecurityQuestion.findAll({
      where: { '$users.username$': clientCredentials.username },
      include: [User],
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // respond the the client with the user's security question
  res.status(200).send({
    security_question: questionQueryResult[0].dataValues.question,
    security_question_id: usersQueryResult[0].dataValues.security_question_id,
  });
};

// controller to reset the user's password
const resetPassword = async (req, res) => {

  const clientCredentials = req.body;

  // validate input from the client
  if (!clientCredentials.username) {
    res.status(400).send({
      what: 'username',
      message: 'Username is required.',
    });
    return;
  }
  if (!clientCredentials.security_question_answer) {
    res.status(400).send({
      what: 'security_question_answer',
      message: 'Security Question Answer is required.',
    });
    return;
  }
  if (!clientCredentials.password) {
    res.status(400).send({
      what: 'password',
      message: 'Password is required.',
    });
    return;
  }
  if (!passwordRegex.test(clientCredentials.password)) {
    res.status(400).send({
      what: 'password',
      message: 'Password is invalid.',
    });
    return;
  }
  if (!clientCredentials.pass_verify) {
    res.status(400).send({
      what: 'pass_verify',
      message: 'Password Confirmation is required.',
    });
    return;
  }
  if (clientCredentials.pass_verify !== clientCredentials.password) {
    res.status(400).send({
      what: 'pass_verify',
      message: 'Password Confirmation is invalid.',
    });
    return;
  }

  // get users with matching username from the users table in the db
  let usersQueryResult;
  try {
    usersQueryResult = await User.findAll({
      where: { username: clientCredentials.username },
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // if user does not exist respond with an error message
  if (usersQueryResult.length === 0) {
    res.status(400).send({
      what: 'username',
      message: 'User does not exist.',
    });
    return;
  }

  // compare security question answer to value stored in db
  const securityQuestionAnswer = clientCredentials.security_question_answer;
  const securityQuestionAnswerHash = 
    usersQueryResult[0].dataValues.security_question_answer;
  let securityQuestionAnswerCompareResult;
  try {
    securityQuestionAnswerCompareResult = await bcryptCompare(
      clientCredentials.security_question_answer, securityQuestionAnswerHash
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // if security question answer was incorrect, send a message to the client
  if (!securityQuestionAnswerCompareResult) {
    res.status(400).send({
      what: 'security_question_answer',
      message: 'Security question answer is incorrect.',
    });
    return;
  }

  // hash the user's new password
  let newPasswordHash;
  try {
    newPasswordHash = await bcryptHash(clientCredentials.password, saltRounds);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // update the user's password
  try {
    await User.update(
      { password: newPasswordHash },
      { where: { username: clientCredentials.username } },
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }

  // respond to the client with OK status code
  res.sendStatus(200);
};

const user_controller = {
  login: login,
  create: create,
  checkLogin: checkLogin,
  logout: logout,
  findUser: findUser,
  resetPassword: resetPassword,
};

module.exports = user_controller;
