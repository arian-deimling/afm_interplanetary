/* eslint-disable no-await-in-loop */

import Sequelize from 'sequelize';

import dbConfig from '../config/db.config.js';
import reservation from './reservation.model.js';
import seat from './seat.model.js';
import security_question from './security_question.model.js';
import trip from './trip.model.js';
import user from './user.model.js';

const db = {};
db.connection = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: '0',
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const User = user(db.connection, Sequelize);
const SecurityQuestion = security_question(db.connection, Sequelize);
const Trip = trip(db.connection, Sequelize);
const Reservation = reservation(db.connection, Sequelize);
const Seat = seat(db.connection, Sequelize);

// define table relationships
SecurityQuestion.hasMany(User, { foreignKey: 'security_question_id', });
User.belongsTo(SecurityQuestion, { foreignKey: 'security_question_id', });
User.belongsToMany(Trip, {
  through: Reservation,
  foreignKey: 'user_id',
});
Trip.belongsToMany(User, {
  through: Reservation,
  foreignKey: 'trip_id',
});
Reservation.belongsTo(User, { foreignKey: 'user_id', });
Reservation.belongsTo(Trip, { foreignKey: 'trip_id', });
Reservation.hasMany(Seat, { foreignKey: 'reservation_id', });
Seat.belongsTo(Reservation, { foreignKey: 'reservation_id', });

// add models to db object
db.user = User;
db.security_question = SecurityQuestion;
db.trip = Trip;
db.reservation = Reservation;
db.seat = Seat;

// add security questions to the security question table
db.security_question.sync().then(async() => {
  try {
    await db.security_question.create({
      question: 'What was your childhood nickname?',
    });
    await db.security_question.create({
      question: 'In what city did you meet your spouse/significant other?',
    });
    await db.security_question.create({
      question: 'What is the name of your favorite childhood friend?',
    });
    await db.security_question.create({
      question: 'What street did you live on in third grade?',
    });
    await db.security_question.create({
      question: 'What is the middle name of your youngest child?',
    });
    await db.security_question.create({
      question: 'What is your oldest sibling\'s middle name?',
    });
    await db.security_question.create({
      question: 'What school did you attend for sixth grade?',
    });
    await db.security_question.create({
      question: 'What is your oldest cousin\'s first and last name?',
    });
  } catch (err) {
    /* ignore */
  }
});

// add trips for every 1st and 3rd Saturday of the month for every date from
// today until approximate 1/2 year from today
db.trip.sync().then(async() => {
  let current = new Date();
  current = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate()
  );

  // end is approx. 1/2 year from today
  const end = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate() + 183
  );

  // increment date until the day of the week is Saturday
  while (current.getDay() !== 6) {
    current.setDate(current.getDate() + 1);
  }

  while (current.getTime() < end.getTime()) {
    const id = Math.round((current - new Date('2000-01-01')) /
                          (1000 * 60 * 60 * 24));

    // check whether the current date is in the first or third week of the month
    const isFirstOrThirdWeek =
      current.getDate() >= 1 && current.getDate() <= 7 ||
      current.getDate() >= 15 && current.getDate() <= 21;

    // create a new trip with current date if it is the first or third
    // Saturday of the month
    if (isFirstOrThirdWeek) {
      try {
        await db.trip.create({
          id,
          date: current,
          capacity: 12,
        });
      } catch (err) {
        /* ignore */
      }
    }
    // increment current date by a week
    current.setDate(current.getDate() + 7);
  }
});

export default db;
