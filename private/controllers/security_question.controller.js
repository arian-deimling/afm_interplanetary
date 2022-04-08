'use strict';

const db = require('../models');

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

const security_question_controller = {
  getQuestions: getQuestions,
}

module.exports = security_question_controller;
