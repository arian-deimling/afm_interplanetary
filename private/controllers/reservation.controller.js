const sequelize = require('sequelize');
const { trip } = require('../models');
const db = require('../models');

const Trip = db.trip;
const Reservation = db.reservation;

async function _getRemainingCapacity(date) {
  if (!date) {
    return {
      what: 'trip_date',
      message: 'Trip date is required.',
    };
  }

  // get trip capacity from DB
  let tripCapacityQueryResult;
  try {
    tripCapacityQueryResult = await Trip.findAll({
      where: { date: new Date(date) },
    });
  } catch (err) {
    return {
      what: 'unknown',
      message: err.message,
    };
  }

  // check whether query returned a result
  if (tripCapacityQueryResult.length === 0) {
    return {
      what: 'trip_date',
      message: 'Trip date is required.',
    };
  }
  // extract capacity from query result
  const tripCapacity = tripCapacityQueryResult[0].dataValues.capacity;

  // get the number of spots taken on the specified trip
  let spotsTaken;
  try {
    spotsTaken = await Reservation.sum('num_passengers', {
      include: [{
        model: Trip,
        where: { date: new Date(date) },
      }],
    });
  } catch (err) {
    return {
      what: 'unknown',
      message: err.message,
    };
  }
  spotsTaken = spotsTaken ?? 0;

  return { remainingCapacity: tripCapacity - spotsTaken };
}

// TODO(AD) - exclude trips that are full
const getTripDates = async (req, res) => {

 // get all trip dates from the db
 let tripDatesQueryResult;
 try {
   tripDatesQueryResult = await Trip.findAll({
     attributes: ['id', 'date', 'capacity'],
   });
 } catch (err) {
   console.log(err.message);
   res.sendStatus(500);
   return;
 }
 // get number of passengers already assigned to each trip
 let tripPassengersQueryResult;
 try {
   tripPassengersQueryResult = await Reservation.findAll({
     where: { user_id: {[sequelize.Op.not]: req.session.userID }},
     attributes: [
       'trip_id',
       [sequelize.fn('sum', sequelize.col('num_passengers')), 'trip_passengers']
     ],
     group: ['trip_id'],
   });
 } catch (err) {
   console.log(err);
   res.sendStatus(500);
   return;
 }
 // create a map that maps trip dates to remaining capacity
 let tripCapacities = {};
 tripDatesQueryResult.map(x => {
   tripCapacities[x.dataValues.id] = [x.dataValues.capacity, x.dataValues.date];
 });

 // adjust remaining capacity for number of passengers already assigned to trip
 for (const trip of tripPassengersQueryResult) {
   tripCapacities[trip.dataValues.trip_id][0] -= trip.dataValues.trip_passengers
 }

 // extract dates that have more than 0 remaining seats
 const validDates = Object.values(tripCapacities).filter(x => x[0] !== 0).map(x => x[1]);

 // send the trip dates to the client
 res.status(200).send(validDates);

};

const getRemainingCapacity = async (req, res) => {

  let capacityResult = await _getRemainingCapacity(req.body.trip_date);

  // on unknown error, log and send 500 status
  if (capacityResult.what !== undefined && capacityResult.what === 'unknown') {
    console.log(capacityResult.message);
    res.sendStatus(500);
    return;
  }

  // on known error, send error
  if (capacityResult.what !== undefined) {
    res.status(400).send(capacityResult);
    return;
  }

  // check whether the user currently has a reservation on the selected trip
  let existingReservationQueryResult;
  try {
    existingReservationQueryResult = await Reservation.findAll({
      where: { user_id: req.session.userID },
      include: [{
        model: Trip,
        where: { date: new Date(req.body.trip_date) },
      }]
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
  // store the number of seats the user has reserved for the selected trip
  let currentReservedSeats = 0;
  if (existingReservationQueryResult.length !== 0) {
    currentReservedSeats = existingReservationQueryResult[0].dataValues.num_passengers;
  }

  // if there are no more remaining seats, send error
  if (currentReservedSeats === 0 && capacityResult.remainingCapacity === 0) {
    res.status(400).send({
      what: 'trip_date',
      message: 'This trip is at capacity. Please select a different trip date.',
    });
    return;
  }
  // send remaining capacity
  res.status(200).send({
    remaining_capacity: capacityResult.remainingCapacity,
    currentReservedSeats: currentReservedSeats,
  });
}

const create = async (req, res) => {
  // if the user is not logged in, respond with an error message
  if (!req.session.userID) {
    res.status(400).send({
      what: 'login_status',
      message: 'You must be logged in to create a reservation',
    });
    return;
  }

  const reservationInfo = req.body;

  // validate input exists
  if (!reservationInfo.num_passengers) {
    req.status(400).send({
      what: 'num_passengers',
      message: 'Number of passengers is required.',
    });
  }

  let capacityResult = await _getRemainingCapacity(reservationInfo.trip_date);

  // on unknown error, log and send 500 status
  if (capacityResult.what !== undefined && capacityResult.what === 'unknown') {
    console.log(capacityResult.message);
    res.sendStatus(500);
    return;
  }

  // on known error, send error
  if (capacityResult.what !== undefined) {
    res.status(400).send(capacityResult);
    return;
  }

  // check whether the user currently has a reservation on the selected trip
  let existingReservationQueryResult;
  try {
    existingReservationQueryResult = await Reservation.findOne({
      where: { user_id: req.session.userID },
      include: [{
        model: Trip,
        where: { date: new Date(req.body.trip_date) },
      }]
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }

  // store the number of seats the user has reserved for the selected trip
  let currentReservedSeats = 0;
  if (existingReservationQueryResult) {
    currentReservedSeats = existingReservationQueryResult.dataValues.num_passengers;
  }

  // if there are not enough seats 
  if (capacityResult.remainingCapacity + currentReservedSeats < reservationInfo.num_passengers) {
    res.status(400).send({
      what: 'trip_date',
      message: 'The number of passengers exceeds the remaining capacity for this trip.',
    });
    return;
  }

  // get the trip ID
  let tripQueryResult;
  try {
    tripQueryResult = await Trip.findAll({
      where: { date: new Date(reservationInfo.trip_date) },
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
  const tripId = tripQueryResult[0].dataValues.id;

  // create or update the reservation
  try {
    if (existingReservationQueryResult) {
      await existingReservationQueryResult.update({
        num_passengers: reservationInfo.num_passengers,
      });
    } else {
      await Reservation.create({
        num_passengers: reservationInfo.num_passengers,
        trip_id: tripId,
        user_id: req.session.userID,
      });
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }

  res.sendStatus(200);
}

const allReservations = async (req, res) => {

  spotsTaken = await Reservation.findAll({
    where: { user_id: req.session.userID },
    include: [Trip],
  });

  res.status(200).send(spotsTaken.map(x => {
    return {
      id: x.dataValues.id,
      num_passengers: x.dataValues.num_passengers,
      createdAt: x.dataValues.createdAt,
      updatedAt: x.dataValues.updatedAt,
      trip_date: x.dataValues.trip.dataValues.date,
    };
  }));
  return;

  console.log(spotsTaken);
  res.sendStatus(200);
}

reservationController = {
  getTripDates: getTripDates,
  getRemainingCapacity: getRemainingCapacity,
  create: create,
  allReservations: allReservations,
}

module.exports = reservationController;
