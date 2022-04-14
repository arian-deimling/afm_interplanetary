import db from '../models/index.js';
import sequelize from 'sequelize';

const Trip = db.trip;
const Reservation = db.reservation;
const Seat = db.seat;

/**
 * Middleware to retrieve all of the current user's reservations.
 *
 * Prerequisite(s): {@link validateLoggedIn}
 *
 * Sets: `res.locals.userReservations`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function getAllUserReservations(req, res, next) {
  try {
    // eslint-disable-next-line require-atomic-updates
    res.locals.userReservations = await Reservation.findAll({
      attributes: [
        'id',
        'num_passengers',
        'createdAt',
        'updatedAt',
        [ sequelize.literal('trip.date'), 'trip_date', ],
      ],
      where: { user_id: res.locals.userId, },
      raw: true,
      include: [
        {
          model: Trip,
          attributes: [],
          required: true,
        },
      ],
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }
  next();
}

/**
 * Middleware to add user seat selection to list of user's reservations.
 *
 * Prerequisite(s): {@link getAllUserReservations}
 *
 * Sets: `res.locals.userReservations[i].seats`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function getAllUserSeats(req, res, next) {
  try {
    for (let i = 0; i < res.locals.userReservations.length; i++) {
      // eslint-disable-next-line no-await-in-loop, require-atomic-updates
      res.locals.userReservations[i].seats = (await Seat.findAll({
        attributes: [ 'seat', ],
        raw: true,
        where: { reservation_id: res.locals.userReservations[i].id, },
      })).map((x) => x.seat);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
  next();
}

/**
 * Retrieve all reservation info for the current user.
 *
 * Prerequisite(s): {@link getAllUserSeats}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function getAllReservationsInfo(req, res) {
  res.status(200).send(res.locals.userReservations);
}

/**
 * Middleware to retrieve all trips.
 *
 * Sets: `res.locals.allTrips`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function getAllTrips(req, res, next) {
  try {
    res.locals.allTrips = await Trip.findAll({
      raw: true,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
  next();
}

/**
 * Middleware to retrieve all at-capacity trips.
 *
 * Sets: `res.locals.atCapacityTrips`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function getAtCapacityTrips(req, res, next) {
  try {
    res.locals.atCapacityTrips = (await Reservation.findAll({
      attributes: [
        [
          sequelize.cast(
            sequelize.fn('sum', sequelize.col('num_passengers')),
            'float'
          ),
          'trip_passengers',
        ],
        [ sequelize.literal('trip.id'), 'id', ],
        [ sequelize.literal('trip.date'), 'date', ],
        [ sequelize.literal('trip.capacity'), 'capacity', ],
      ],
      group: [ 'trip_id', ],
      include: [ { model: Trip, attributes: [], }, ],
      raw: true,
    })).filter((x) => x.trip_passengers === x.capacity).
      map((x) => ({ id: x.id, date: x.date, capacity: x.capacity, }));
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }
  next();
}

/**
 * Middleware to retrieve all of the current user's trips.
 *
 * Prerequisite(s): {@link validateLoggedIn}
 *
 * Sets: `res.locals.userTrips`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function getUserTrips(req, res, next) {
  try {
    // eslint-disable-next-line require-atomic-updates
    res.locals.userTrips = await Reservation.findAll({
      attributes: [
        [ sequelize.literal('trip.id'), 'id', ],
        [ sequelize.literal('trip.date'), 'date', ],
        [ sequelize.literal('trip.capacity'), 'capacity', ],
      ],
      where: { user_id: res.locals.userId, },
      include: [ { model: Trip, attributes: [], }, ],
      raw: true,
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }
  next();
}

/**
 * Retrieve all trips dates for which the current user can create/modify a
 * reservation.
 *
 * Prerequisite(s): {@link getAllTrips},
 *                  {@link getAtCapacityTrips},
 *                  {@link getUserTrips}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function getAvailableTripDates(req, res) {
  // atCapacityTrips - userTrips
  const unavailableTrips = res.locals.atCapacityTrips.filter((x) => {
    if (res.locals.userTrips.length === 0) {
      return true;
    }
    return !res.locals.userTrips.some((y) => y.id === x.id);
  });
  // allTrips - unavailableTrips
  const availableTrips = res.locals.allTrips.filter((x) => {
    if (unavailableTrips.length === 0) {
      return true;
    }
    return !unavailableTrips.some((y) => x.id === y.id);
  });
  // return trip dates only
  res.status(200).send(availableTrips.map((x) => x.date));
}

/**
 * Middleware to validate that a trip date was provided.
 *
 * Sets: `res.locals.tripDate`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateTripDateExists(req, res, next) {
  if (!req.body.trip_date) {
    res.status(400).send({
      what: 'trip_date',
      message: 'Trip date is required.',
    });
    return;
  }
  res.locals.tripDate = req.body.trip_date;
  next();
}

/**
 * Middleware to validate that a trip date is valid.
 *
 * Prerequisite(s): {@link getAllTrips}
 *
 * Sets: `res.locals.date`, `res.locals.dateString`, `res.locals.tripId`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateTripDateIsValid(req, res, next) {
  const timestamp = Date.parse(res.locals.tripDate);
  if (isNaN(timestamp) === true) {
    res.status(400).send({
      what: 'trip_date',
      message: 'Unable to parse trip date.',
    });
    return;
  }
  res.locals.date = new Date(timestamp);
  const [ dateString, ] = res.locals.date.toISOString().split('T');
  res.locals.dateString = dateString;

  // for each trip
  res.locals.allTrips.forEach((x) => {
    if (x.date === dateString) {
      res.locals.tripId = x.id;
    }
  });
  if (!res.locals.tripId) {
    res.status(400).send({
      what: 'trip_date',
      message: 'Trip date provided does not match any trips.',
    });
    return;
  }
  next();
}

/**
 * Middleware to get all seats associated with the current trip.
 *
 * Prerequisite(s): {@link validateTripDateIsValid}
 *
 * Sets: `res.locals.seats`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function getSeatsByTrip(req, res, next) {
  try {
    // eslint-disable-next-line require-atomic-updates
    res.locals.seats = await Reservation.findAll({
      attributes: [
        'user_id',
        [ sequelize.literal('seats.seat'), 'seat', ],
      ],
      include: [
        { model: Trip, attributes: [], where: { id: res.locals.tripId, }, },
        { model: Seat, attributes: [], },
      ],
      raw: true,
    });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
    return;
  }
  next();
}

/**
 * Middleware to get all current user's seats on the current trip.
 *
 * Prerequisite(s): {@link getSeatsByTrip}
 *
 * Sets: `res.locals.userSeats`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function getUserSeats(req, res, next) {
  res.locals.userSeats =
    res.locals.seats.filter((x) => x.user_id === res.locals.userId);
  res.locals.userSeats =
    res.locals.userSeats.map((x) => x.seat);
  next();
}

/**
 * Middleware to get all other user's seats on the current trip.
 *
 * Prerequisite(s): {@link getSeatsByTrip}
 *
 * Sets: `res.locals.otherSeats`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function getOtherSeats(req, res, next) {
  res.locals.otherSeats =
    res.locals.seats.filter((x) => x.user_id !== res.locals.userId);
  res.locals.otherSeats =
    res.locals.otherSeats.map((x) => x.seat);
  next();
}

/**
 * Retrieve user and non-user seat selections for the current user and trip.
 *
 * Prerequisite(s): {@link getUserSeats},
 *                  {@link getOtherSeats}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function getSeats(req, res) {
  res.status(200).send({
    userSeats: res.locals.userSeats,
    otherSeats: res.locals.otherSeats,
  });
}

/**
 * Ensure user seat selection is valid.
 *
 * Prerequisite(s): {@link getOtherSeats}
 *
 * Sets: `res.locals.seatSelection`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateSeatSelection(req, res, next) {
  let seats = [
    Object.prototype.hasOwnProperty.call(req.body, 'A1') ? 'A1' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'A2') ? 'A2' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'A3') ? 'A3' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'A4') ? 'A4' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'B1') ? 'B1' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'B2') ? 'B2' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'B3') ? 'B3' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'B4') ? 'B4' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'C1') ? 'C1' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'C2') ? 'C2' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'C3') ? 'C3' : '',
    Object.prototype.hasOwnProperty.call(req.body, 'C4') ? 'C4' : '',
  ];
  seats = seats.filter((x) => x !== '');
  let collisionFound = false;
  seats.forEach((x) => {
    if (!collisionFound && res.locals.otherSeats.includes(x)) {
      res.status(400).send({
        what: 'seat_selection',
        message:
          `Selection of seat ${x} collides with another user's reservation`,
      });
      collisionFound = true;
    }
  });
  if (collisionFound) {
    return;
  }
  res.locals.seatSelection = seats;
  next();
}

/**
 * Create a new reservation.
 *
 * Prerequisite(s): {@link getUserSeats},
 *                  {@link validateSeatSelection}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function create(req, res) {
  // find a reservation associated with the specified trip and user
  let existingReservation = null;
  try {
    existingReservation = await Reservation.findOne({
      where: { user_id: res.locals.userId, },
      include: [ { model: Trip, where: { id: res.locals.tripId, }, }, ],
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }

  // create a new reservation entry or update the existing one
  if (existingReservation === null) {
    // eslint-disable-next-line require-atomic-updates
    existingReservation = await Reservation.create({
      num_passengers: res.locals.seatSelection.length,
      trip_id: res.locals.tripId,
      user_id: res.locals.userId,
    });
  } else {
    await existingReservation.update({
      num_passengers: res.locals.seatSelection.length,
    });
  }
  // userSeats - seatSelection | need to remove from seats table
  let destroySeats = res.locals.userSeats.
    filter((x) => !res.locals.seatSelection.includes(x));
  // seatSelection - userSeats | need to create in seats table
  let createSeats = res.locals.seatSelection.
    filter((x) => !res.locals.userSeats.includes(x));

  destroySeats = destroySeats.map((x) => ({
    reservation_id: existingReservation.id,
    seat: x,
  }));
  createSeats = createSeats.map((x) => ({
    reservation_id: existingReservation.id,
    seat: x,
  }));
  // create and destory entries from the seats table
  for (const seat of destroySeats) {
    Seat.destroy({ where: seat, });
  }
  Seat.bulkCreate(createSeats);

  res.sendStatus(200);
}

/**
 * Ensure that a reservation id was provided.
 *
 * Sets: `res.locals.reservationId`
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
function validateReservationIdExists(req, res, next) {
  if (!req.body.id) {
    res.status(400).send({
      what: 'reservation',
      message: 'Reservation is required.',
    });
    return;
  }
  res.locals.reservationId = req.body.id;
  next();
}

/**
 * Ensure that provided reservation id belongs to current user.
 *
 * Prerequisite(s): {@link validateReservationIdExists}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function validateReservationOwnership(req, res, next) {
  let reservation = null;
  try {
    reservation = await Reservation.findOne({
      where: {
        user_id: res.locals.userId,
        id: res.locals.reservationId,
      },
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
  if (reservation === null) {
    res.status(400).send({
      what: 'reservation',
      message: 'Reservation does not exist.',
    });
    return;
  }
  next();
}

/**
 * Delete the specified reservation.
 *
 * Prerequisite(s): {@link validateReservationOwnership}
 *
 * @param {Request} req request that is currently being used
 * @param {Response} res response that is currently being used
 * @param {NextFunction} next next request/response handler to call
 */
async function deleteReservation(req, res) {
  // delete the reservation
  try {
    await Reservation.destroy({
      where: {
        id: res.locals.reservationId,
      },
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
  // delete the seats
  await Seat.destroy({
    where: { reservation_id: res.locals.reservationId, },
  });
  res.sendStatus(200);
}

export {
  getAvailableTripDates,
  create,
  deleteReservation,
  getSeats,
  getAllUserReservations,
  getAllUserSeats,
  getAllReservationsInfo,
  getAllTrips,
  getAtCapacityTrips,
  getUserTrips,
  validateTripDateExists,
  validateTripDateIsValid,
  getSeatsByTrip,
  getUserSeats,
  getOtherSeats,
  validateSeatSelection,
  validateReservationIdExists,
  validateReservationOwnership
};
