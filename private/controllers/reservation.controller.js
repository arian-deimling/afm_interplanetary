'use strict';

const sequelize = require('sequelize');
const db = require('../models');

const Trip = db.trip;
const Reservation = db.reservation;
const Seat = db.seat;

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
    res.status(400).send({
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
      what: 'num_passengers',
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

  // get the seats that were selected by the user
  let seats = [
    { seat: 'A1', selected: req.body.A1 },
    { seat: 'A2', selected: req.body.A2 },
    { seat: 'A3', selected: req.body.A3 },
    { seat: 'A4', selected: req.body.A4 },
    { seat: 'B1', selected: req.body.B1 },
    { seat: 'B2', selected: req.body.B2 },
    { seat: 'B3', selected: req.body.B3 },
    { seat: 'B4', selected: req.body.B4 },
    { seat: 'C1', selected: req.body.C1 },
    { seat: 'C2', selected: req.body.C2 },
    { seat: 'C3', selected: req.body.C3 },
    { seat: 'C4', selected: req.body.C4 },
  ];
  seats = seats.filter(x => x.selected !== undefined);

  // assert that number of passengers matches number of seats selected
  if (seats.length != reservationInfo.num_passengers) {
    res.status(400).send({
      what: 'num_passengers',
      message: 'Number of seats selected must match number from passenger selection field.',
    });
    return;
  }

  // generate array of seats occupied by other users' reservations
  let otherUserSeatsQueryResult = await Reservation.findAll({
    where: {
      user_id: { [sequelize.Op.not]: req.session.userID },
      trip_id: tripId,
    },
    raw: true,
    include: [{
      model: Seat,
      required: true,
    }],
  });
  let othersSeats = [];
  if (otherUserSeatsQueryResult !== null) {
    othersSeats = otherUserSeatsQueryResult.map(x => x['seats.seat']);
  }
  let userSeats = seats.map(x => x.seat);
  let intersection = othersSeats.filter(x => userSeats.includes(x));

  // assert no collisions exist between user's selected seats and other users' seat selections
  if (intersection.length !== 0) {
    res.status(400).send({
      what: intersection[0],
      message: 'Seat selection collides with another user\'s seat selection.',
    });
    return;
  }

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

  // get reservation id for the current reservation
  let reservationQuery = await Reservation.findOne({
    where: {
      trip_id: tripId,
      user_id: req.session.userID,
    }
  });
  let reservationId = reservationQuery.dataValues.id;

  // remove all seats currently associated with the reservation from 
  // the seats table
  await Seat.destroy({
    where: { reservation_id: reservationId }
  });

  // add user seats to seats table
  let seatRows = userSeats.map(x => {
    return { seat: x, reservation_id: reservationId };
  });
  await Seat.bulkCreate(seatRows);

  res.sendStatus(200);
}

const allReservations = async (req, res) => {

  if (!req.session.userID) {
    res.status(400).send({
      what: 'login_status',
      message: 'You must be logged in to view reservations.',
    });
    return;
  }

  let spotsTaken = await Reservation.findAll({
    where: { user_id: req.session.userID },
    include: [Trip],
  });

  for (let i = 0; i < spotsTaken.length; i++) {
    let seats = await Seat.findAll({
      where: { reservation_id: spotsTaken[i].dataValues.id }
    });
    seats = seats.map(x => x.dataValues.seat);
    spotsTaken[i].seats = seats;
  }

  res.status(200).send(spotsTaken.map(x => {
    return {
      id: x.dataValues.id,
      num_passengers: x.dataValues.num_passengers,
      createdAt: x.dataValues.createdAt,
      updatedAt: x.dataValues.updatedAt,
      trip_date: x.dataValues.trip.dataValues.date,
      seats: x.seats,
    };
  }));
}

const deleteReservation = async (req, res) => {

  if (!req.session.userID) {
    res.status(400).send({
      what: 'login_status',
      message: 'You must be logged in to delete a reservation.',
    });
    return;
  }

  // make sure a reservation identifier was provided
  if (!req.body.id) {
    res.status(400). send({ what: '', message: '', });
    return;
  }

  // delete the reservation
  try {
    await Reservation.destroy({
      where: {
        id: req.body.id,
      },
    })
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }

  await Seat.destroy({
    where: { reservation_id: req.body.id },
  });
  
  res.sendStatus(200);
}

const getSeats = async (req, res) => {

  // if the user is not logged in, respond with an error message
  if (!req.session.userID) {
    res.status(400).send({
      what: 'login_status',
      message: 'You must be logged in to create a reservation',
    });
    return;
  }

  const userId = req.session.userID;
  const tripDate = req.body.trip_date;

  // validate input exists
  if (!tripDate) {
    res.status(400).send({
      what: 'trip_date',
      message: 'Trip date is required.',
    });
  }

  // validate trip exists
  let trip = await Trip.findOne({
    where: { date: new Date(tripDate) }
  });
  if (trip === null) {
    res.status(400).send({
      what: 'trip_date',
      message: 'Trip does not exist.',
    });
  }

  // query db for seats
  let getSeatsQueryResult = await Reservation.findAll({
    raw: true,
    include: [
      { model: Seat, required: true, },
      { model: Trip, required: true, where: { date: new Date(tripDate) } },
    ],
  });

  // generate a list of seats selected by this user and other users
  const userSeats = [];
  const otherSeats = [];
  getSeatsQueryResult.map(x => {
    if (x.user_id == userId) {
      userSeats.push(x['seats.seat']);
    } else {
      otherSeats.push(x['seats.seat']);
    }
  });


  res.status(200).send({
    userSeats,
    otherSeats,
  });
}

const reservationController = {
  getTripDates: getTripDates,
  getRemainingCapacity: getRemainingCapacity,
  create: create,
  allReservations: allReservations,
  deleteReservation: deleteReservation,
  getSeats: getSeats,
}

module.exports = reservationController;
