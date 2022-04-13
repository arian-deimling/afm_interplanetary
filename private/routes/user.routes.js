import {
  checkLogin,
  create,
  findUserByUsername,
  findUserQuestion,
  getQuestions,
  hashPassword,
  hashSecurityQuestionAnswer,
  login,
  logout,
  resetPassword,
  validatePasswordIsValid,
  validatePasswordMatches,
  validatePasswordProvided,
  validateSecurityQuestionAnswerIsValid,
  validateSecurityQuestionAnswerMatches,
  validateSecurityQuestionAnswerProvided,
  validateSecurityQuestionIdIsValid,
  validateSecurityQuestionIdProvided,
  validateUserDoesNotExist,
  validateUserExists,
  validateUsernameIsValid,
  validateUsernameProvided
} from '../controllers/user.controller.js';

import { Router } from 'express';


const userRoutes = (app) => {

  const router = new Router();

  // create a new user
  router.post(
    '/signup',
    validateUsernameProvided,
    validateUsernameIsValid,
    validatePasswordProvided,
    validatePasswordIsValid,
    validateSecurityQuestionIdProvided,
    validateSecurityQuestionIdIsValid,
    validateSecurityQuestionAnswerProvided,
    validateSecurityQuestionAnswerIsValid,
    findUserByUsername,
    validateUserDoesNotExist,
    hashPassword,
    hashSecurityQuestionAnswer,
    create
  );

  // login the user
  router.post(
    '/login',
    validateUsernameProvided,
    validatePasswordProvided,
    findUserByUsername,
    validateUserExists,
    validatePasswordMatches,
    login
  );

  // check the user's login status
  router.get(
    '/login',
    checkLogin
  );

  // log the user out
  router.get(
    '/logout',
    logout
  );

  // get security question for a user
  router.post(
    '/find',
    validateUsernameProvided,
    findUserByUsername,
    validateUserExists,
    findUserQuestion
  );

  // update a user's password
  router.post(
    '/reset',
    validateUsernameProvided,
    validateSecurityQuestionAnswerProvided,
    validatePasswordProvided,
    validatePasswordIsValid,
    findUserByUsername,
    validateUserExists,
    validateSecurityQuestionAnswerMatches,
    hashPassword,
    resetPassword
  );

  // get all available security questions
  router.get(
    '/security_questions',
    getQuestions
  );

  app.use('/api/user', router);
};

export default userRoutes;
