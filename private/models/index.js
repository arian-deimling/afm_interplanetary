const dbConfig = require('../config/db.config');
const Sequelize = require('sequelize');

const db = {};
db.connection = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: '0',
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const User = require('./user.model')(db.connection, Sequelize);
const SecurityQuestion = require('./security_question.model')(db.connection, Sequelize);

// add models to db object
db.user = User
db.security_question = SecurityQuestion

// add security questions to the security question table
db.security_question.sync({ force: true }).then(async () => {
  await db.security_question.create({
    question: 'What was your childhood nickname?'
  });
  await db.security_question.create({
    question: 'In what city did you meet your spouse/significant other?'
  });
  await db.security_question.create({
    question: 'What is the name of your favorite childhood friend?'
  });
  await db.security_question.create({
    question: 'What street did you live on in third grade?'
  });
  await db.security_question.create({
    question: 'What is the middle name of your youngest child?'
  });
  await db.security_question.create({
    question: "What is your oldest sibling's middle name?"
  });
  await db.security_question.create({
    question: 'What school did you attend for sixth grade?'
  });
  await db.security_question.create({
    question: "What is your oldest cousin's first and last name?"
  });
});

module.exports = db;
