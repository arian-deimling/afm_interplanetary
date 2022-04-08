'use strict';

const securityQuestionRoutes = app => {

  const security_question_control = require('../controllers/security_question.controller');
  let router = require('express').Router();

  // get all security questions
  router.get('/security_questions', security_question_control.getQuestions);

  // TODO(AD) - base URL should be different for each `routes` file
  app.use('/api', router);
};

module.exports = securityQuestionRoutes;
