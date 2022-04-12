

import { Router } from 'express';

import user_controller from '../controllers/user.controller.js';

const userRoutes = (app) => {

  const router = new Router();

  // create a new user
  router.post(
    '/signup',
    user_controller.validateUsernameProvided,
    user_controller.validateUsernameIsValid,
    user_controller.validatePasswordProvided,
    user_controller.validatePasswordIsValid,
    user_controller.validateSecurityQuestionIdProvided,
    user_controller.validateSecurityQuestionIdIsValid,
    user_controller.validateSecurityQuestionAnswerProvided,
    user_controller.validateSecurityQuestionAnswerIsValid,
    user_controller.findUserByUsername,
    user_controller.validateUserDoesNotExist,
    user_controller.hashPassword,
    user_controller.hashSecurityQuestionAnswer,
    user_controller.create
  );

  // login the user
  router.post(
    '/login',
    user_controller.validateUsernameProvided,
    user_controller.validatePasswordProvided,
    user_controller.findUserByUsername,
    user_controller.validateUserExists,
    user_controller.validatePasswordMatches,
    user_controller.login
  );

  // check the user's login status
  router.get(
    '/login',
    user_controller.checkLogin
  );

  // log the user out
  router.get(
    '/logout',
    user_controller.logout
  );

  // get security question for a user
  router.post(
    '/find',
    user_controller.validateUsernameProvided,
    user_controller.findUserByUsername,
    user_controller.validateUserExists,
    user_controller.findUserQuestion
  );

  // update a user's password
  router.post(
    '/reset',
    user_controller.validateUsernameProvided,
    user_controller.validateSecurityQuestionAnswerProvided,
    user_controller.validatePasswordProvided,
    user_controller.validatePasswordIsValid,
    user_controller.findUserByUsername,
    user_controller.validateUserExists,
    user_controller.validateSecurityQuestionAnswerMatches,
    user_controller.hashPassword,
    user_controller.resetPassword
  );

  // get all available security questions
  router.get(
    '/security_questions',
    user_controller.getQuestions
  );

  app.use('/api/user', router);
};

export default userRoutes;
