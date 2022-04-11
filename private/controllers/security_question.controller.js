'use strict';

import db from '../models/index.js';

const SecurityQuestion = db.security_question;

const getQuestions = async (_, res) => {
  // get all security questions from the db
  let securityQuestionQueryResult;
  try {
    securityQuestionQueryResult = await SecurityQuestion.findAll();
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }
  // send the security questions to the client
  res.status(200).send(securityQuestionQueryResult);
};

export default {
  getQuestions: getQuestions,
};
