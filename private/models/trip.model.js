'use strict';

const trip = (sequelize, Sequelize) => {

  const Trip = sequelize.define('trip', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    },

    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      unique: true,
    },

    capacity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },

  {
    timestamps: false,
  });

  return Trip;
};

module.exports = trip;
