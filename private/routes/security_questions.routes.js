'use strict';

import { Router } from 'express';

import security_question_control from '../controllers/security_question.controller.js';

const securityQuestionRoutes = app => {

  let router = Router();

  // get all security questions
  router.get('/security_questions', security_question_control.getQuestions);

  // TODO(AD) - base URL should be different for each `routes` file
  app.use('/api', router);
};

export default securityQuestionRoutes;
