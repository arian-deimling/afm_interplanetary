const securityQuestionRoutes = app => {

  const security_question_control = require('../controllers/security_question.controller');
  let router = require('express').Router();

  // get all security questions
  router.get("/security_questions", security_question_control.get_questions);

  app.use('/api', router);
};

module.exports = securityQuestionRoutes;
