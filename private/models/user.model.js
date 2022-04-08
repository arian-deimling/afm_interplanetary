'use strict';

const user = (sequelize, Sequelize) => {

  const User = sequelize.define('user', {

    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    security_question_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: Sequelize.STRING(500),
      allowNull: false,
    },

    security_question_answer: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  return User;
};

module.exports = user;
