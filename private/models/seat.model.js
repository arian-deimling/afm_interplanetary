/* eslint-disable new-cap */

const seat = (sequelize, Sequelize) => {

  const Seat = sequelize.define(
    'seat', {
      seat: {
        type: Sequelize.STRING(2),
        allowNull: false,
        unique: 'seat_reservation_id',
      },

      reservation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'seat_reservation_id',
      },
    },
    {
      timestamps: false,
    }
  );

  return Seat;
};

export default seat;
