const security_question = (sequelize, Sequelize) => {

  const SecurityQuestion = sequelize.define('security_question', {

    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validate: {
        min: 1,
      }
    },

    question: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  },

  {
    timestamps: false,
  });
  return SecurityQuestion;
};

module.exports = security_question;
