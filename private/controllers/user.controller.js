import {
  passwordRegex,
  securityQuestionAnswerRegex,
  usernameRegex
} from '../../public/scripts/config/validation.config.js';

import bcrypt from 'bcrypt';
import db from '../models/index.js';
import express from 'express';
import { saltRounds } from '../config/hash.config.js';
import util from 'util';

// eslint-disable-next-line no-unused-vars
const { NextFunction, Request, Response, } = express;

const User = db.user;
const SecurityQuestion = db.security_question;

// promisify the bcrypt.compare() and bcrypt.hash() methods
const bcryptCompare = util.promisify(bcrypt.compare);
const bcryptHash = util.promisify(bcrypt.hash);

/**
 * Middleware to ensure request body contains a username.
 *
 * Prerequisite(s): `none`
 *
 * Sets: `res.locals.username`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateUsernameProvided(req, res, next) {
  if (req.body.username) {
    res.locals.username = req.body.username;
    next();
    return;
  }
  res.status(400).send({
    what: 'username',
    message: 'Username is required.',
  });
}

/**
 * Middleware to ensure that request username is valid.
 *
 * Prerequisite(s): {@link validateUsernameProvided}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateUsernameIsValid(req, res, next) {
  if (usernameRegex.test(res.locals.username)) {
    next();
    return;
  }
  res.status(400).send({
    what: 'username',
    message: 'Username is invalid.',
  });
}

/**
 * Middleware to ensure request body contains a password.
 *
 * Sets: `req.locals.password`
 *
 * Prerequisite(s): `none`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validatePasswordProvided(req, res, next) {
  if (req.body.password) {
    res.locals.password = req.body.password;
    next();
    return;
  }
  res.status(400).send({
    what: 'password',
    message: 'Password is required.',
  });
}

/**
 * Middleware to ensure that request password is valid.
 *
 * Prerequisite(s): {@link validatePasswordProvided}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validatePasswordIsValid(req, res, next) {
  if (passwordRegex.test(res.locals.password)) {
    next();
    return;
  }
  res.status(400).send({
    what: 'password',
    message: 'Password is invalid.',
  });
}

/**
 * Middleware to ensure request body contains a security question id.
 *
 * Sets: `req.locals.securityQuestionId`
 *
 * Prerequisite(s): `none`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateSecurityQuestionIdProvided(req, res, next) {
  if (req.body.security_question_id) {
    res.locals.securityQuestionId = req.body.security_question_id;
    next();
    return;
  }
  res.status(400).send({
    what: 'security_question_id',
    message: 'Security Question is required.',
  });
}

/**
 * Middleware to ensure that request security question id is valid.
 *
 * Prerequisite(s): {@link validateSecurityQuestionIdProvided}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function validateSecurityQuestionIdIsValid(req, res, next) {
  const minId = await SecurityQuestion.min('id');
  const maxId = await SecurityQuestion.max('id');
  const validQuestionId = res.locals.securityQuestionId >= minId &&
    res.locals.securityQuestionId <= maxId;
  if (validQuestionId) {
    next();
    return;
  }
  res.status(400).send({
    what: 'security_question_id',
    message: 'Security Question is invalid.',
  });
}

/**
 * Middleware to ensure request body contains a security question answer.
 *
 * Sets: `res.locals.securityQuestionAnswer`
 *
 * Prerequisite(s): `none`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateSecurityQuestionAnswerProvided(req, res, next) {
  if (req.body.security_question_answer) {
    res.locals.securityQuestionAnswer = req.body.security_question_answer;
    next();
    return;
  }
  res.status(400).send({
    what: 'security_question_answer',
    message: 'Security Question Answer is required.',
  });
}

/**
 * Middleware to ensure that request security question answer is valid.
 *
 * Prerequisite(s): {@link validateSecurityQuestionAnswerProvided}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateSecurityQuestionAnswerIsValid(req, res, next) {
  if (securityQuestionAnswerRegex.test(res.locals.securityQuestionAnswer)) {
    next();
    return;
  }
  res.status(400).send({
    what: 'security_question_answer',
    message: 'Security Question Answer is invalid.',
  });
}

/**
 * Middleware to query users DB for users that match request username.
 *
 * Sets: `res.locals.usersQueryResult`
 *
 * Prerequisite(s): {@link validateUsernameProvided}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function findUserByUsername(req, res, next) {
  // local user's username, password, and security question answer in the db
  let usersQueryResult = null;
  try {
    usersQueryResult = await User.findOne({
      attributes: [
        'id',
        'username',
        'password',
        'security_question_id',
        'security_question_answer',
      ],
      where: { username: req.body.username, },
    });
  } catch (err) {
    console.log(`validateUserExists: ${err.message}`);
    res.sendStatus(500);
    return;
  }
  res.locals.usersQueryResult = usersQueryResult;
  next();
}

/**
 * Middleware to ensure that request username matches an existing user.
 *
 * Sets: `res.locals.userId`, `res.locals.dbPasswordHash`,
 *       `res.locals.dbSecurityQuestionId`,
 *       `res.locals.dbSecurityQuestionAnswerHash`
 *
 * Prerequisite(s): {@link findUserByUsername}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateUserExists(req, res, next) {
  // if query result is not null, a user was found
  if (res.locals.usersQueryResult) {
    res.locals.userId = res.locals.usersQueryResult.dataValues.id;
    res.locals.dbPasswordHash = res.locals.usersQueryResult.dataValues.password;
    res.locals.dbSecurityQuestionId =
      res.locals.usersQueryResult.dataValues.security_question_id;
    res.locals.dbSecurityQuestionAnswerHash =
      res.locals.usersQueryResult.dataValues.security_question_answer;
    next();
    return;
  }
  // if query does not locate an entry with matching username
  res.status(400).send({
    what: 'username',
    message: 'User does not exist.',
  });
}

/**
 * Middleware to ensure that request username does not match an existing user.
 *
 * Prerequisite(s): {@link findUserByUsername}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateUserDoesNotExist(req, res, next) {
  // pre: findUserByUsername()

  // if query does not locate an entry with matching username
  if (!res.locals.usersQueryResult) {
    next();
    return;
  }
  // if query does not locate an entry with matching username
  res.status(400).send({
    what: 'username',
    message: 'Username is already taken, please try a different one.',
  });
}

/**
 * Middleware to hash password provided in request.
 *
 * Sets: `res.locals.passwordHash`,
 *
 * Prerequisite(s): {@link validatePasswordIsValid}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function hashPassword(req, res, next) {
  // hash the client values for password and security question answer
  try {
    // eslint-disable-next-line require-atomic-updates
    res.locals.passwordHash = await bcryptHash(res.locals.password, saltRounds);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
  next();
}

/**
 * Middleware to hash security question answer provided in request.
 *
 * Sets: `res.locals.securityQuestionAnswerHash`,
 *
 * Prerequisite(s): {@link validateSecurityQuestionAnswerIsValid}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function hashSecurityQuestionAnswer(req, res, next) {
  // hash the client value for security question answer
  try {
    // eslint-disable-next-line require-atomic-updates
    res.locals.securityQuestionAnswerHash =
      await bcryptHash(res.locals.securityQuestionAnswer, saltRounds);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
  next();
}

/**
 * Middleware to ensure provided password matches DB record for user.
 *
 * Prerequisite(s): {@link validateUserExists}, {@link validatePasswordProvided}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function validatePasswordMatches(req, res, next) {
  // compare provided password to stored password hash
  let compareResult = false;
  try {
    compareResult = await bcryptCompare(
      res.locals.password,
      res.locals.dbPasswordHash
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }
  // if password does not match respond with an error message
  if (!compareResult) {
    res.status(400).send({
      what: 'password',
      message: 'Password is incorrect.',
    });
    return;
  }
  next();
}

/**
 * Middleware to ensure provided security question answer matches DB record for
 * user.
 *
 * Prerequisite(s): {@link validateUserExists},
 *                  {@link validateSecurityQuestionAnswerProvided}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function validateSecurityQuestionAnswerMatches(req, res, next) {
  // compare provided password to stored password hash
  let compareResult = false;
  try {
    compareResult = await bcryptCompare(
      res.locals.securityQuestionAnswer,
      res.locals.dbSecurityQuestionAnswerHash
    );
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }
  // if answer does not match respond with an error message
  if (!compareResult) {
    res.status(400).send({
      what: 'security_question_answer',
      message: 'Security Question Answer is incorrect.',
    });
    return;
  }
  next();
}

/**
 * Log user in.
 *
 * Sets: `req.session.userID`
 *
 * Prerequisite(s): {@link validatePasswordMatches}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 */
function login(req, res) {
  // if login is successful, set session userId and send OK status
  req.session.userID = res.locals.userId;
  res.sendStatus(200);
}

/**
 * Create new user account.
 *
 * Prerequisite(s): {@link validateUsernameIsValid},
 *                  {@link validateSecurityQuestionIdIsValid},
 *                  {@link hashPassword},
 *                  {@link hashSecurityQuestionAnswer},
 *                  {@link validateUserDoesNotExist}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 */
async function create(req, res) {
  const newUser = {
    username: res.locals.username,
    password: res.locals.passwordHash,
    security_question_id: res.locals.securityQuestionId,
    security_question_answer: res.locals.securityQuestionAnswerHash,
  };
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
}

/**
 * Respond with 200 if user is logged in; otherwise, respond with 400.
 *
 * Prerequisite(s): `none`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 */
function checkLogin(req, res) {
  // send OK status if there is a valid, active session; otherwise 400
  if (req.session.userID) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
}

/**
 * Log user out and redirect to home page.
 *
 * Sets: `req.session.userID`
 *
 * Prerequisite(s): `none`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 */
function logout(req, res) {
  if (req.session.userID) {
    req.session.userID = 0;
    res.redirect('/');
  } else {
    res.redirect('/');
  }
}

/**
 * Retrieve user's security question.
 *
 * Prerequisite(s): {@link validateUserExists}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 */
async function findUserQuestion(req, res) {
  // find the security question for the user
  let questionQueryResult = null;
  try {
    questionQueryResult = await SecurityQuestion.findOne({
      where: { id: res.locals.dbSecurityQuestionId, },
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }
  // respond the the client with the user's security question
  res.status(200).send({
    security_question: questionQueryResult.dataValues.question,
    security_question_id: res.locals.dbSecurityQuestionId,
  });
}

/**
 * Update user's password.
 *
 * Prerequisite(s): {@link validateUserExists},
 *                  {@link validateSecurityQuestionAnswerMatches},
 *                  {@link hashPassword}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 */
async function resetPassword(req, res) {
  // update user password
  try {
    await res.locals.usersQueryResult.update({
      password: res.locals.passwordHash,
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }
  // respond to the client with OK status code
  res.sendStatus(200);
}

/**
 * Retrieve all security questions.
 *
 * Prerequisite(s): `none`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 */
async function getQuestions(req, res) {
  // get all security questions from the db
  try {
    // send the security questions to the client
    res.status(200).send(await SecurityQuestion.findAll());
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
}

/**
 * Ensure that the user is logged in.
 *
 * Sets: `res.locals.userId`
 *
 * Prerequisite(s): `none`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 */
function validateLoggedIn(req, res, next) {
  if (req.session.userID) {
    res.locals.userId = req.session.userID;
    next();
    return;
  }
  res.status(400).send({
    what: 'login_status',
    message: 'You must be logged in to perform this action.',
  });
}

export {
  login,
  create,
  checkLogin,
  logout,
  findUserQuestion,
  resetPassword,
  validateUsernameProvided,
  validateUsernameIsValid,
  validatePasswordProvided,
  validatePasswordIsValid,
  validateUserExists,
  validatePasswordMatches,
  validateSecurityQuestionIdProvided,
  validateSecurityQuestionIdIsValid,
  validateSecurityQuestionAnswerProvided,
  validateSecurityQuestionAnswerIsValid,
  findUserByUsername,
  validateUserDoesNotExist,
  hashPassword,
  hashSecurityQuestionAnswer,
  validateSecurityQuestionAnswerMatches,
  getQuestions,
  validateLoggedIn
};
