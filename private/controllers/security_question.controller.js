const UNIQUE = '53a2fc5db2423b2c0d4bcd89eabcde5dd5b1aa83a7eb9f9e0356fbc15e66d8f5';
const UNIQUE_COUNTER = 0;

const Sequelize = require('sequelize');
const db = require("../models");
const SecurityQuestion = db.security_question;

const get_questions = (_, res) => {
  // return json of all of the security questions with IDs
  SecurityQuestion.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        where: `${UNIQUE}:${UNIQUE_COUNTER++}`,
        what: err.message || '',
      })
    });
};

security_question_control = {}
security_question_control.get_questions = get_questions;

module.exports = security_question_control;
