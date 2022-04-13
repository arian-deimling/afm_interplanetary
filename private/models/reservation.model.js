const reservation = (sequelize, Sequelize) => {

  const Reservation = sequelize.define('reservation', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    num_passengers: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    trip_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'trip_id_user_id',
    },

    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'trip_id_user_id',
    },
  });

  return Reservation;
};

export default reservation;
