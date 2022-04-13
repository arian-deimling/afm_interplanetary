import {
  create,
  deleteReservation,
  getAllReservationsInfo,
  getAllTrips,
  getAllUserReservations,
  getAllUserSeats,
  getAtCapacityTrips,
  getAvailableTripDates,
  getOtherSeats,
  getSeats,
  getSeatsByTrip,
  getUserSeats,
  getUserTrips,
  validateReservationIdExists,
  validateReservationOwnership,
  validateSeatSelection,
  validateTripDateExists,
  validateTripDateIsValid
} from '../controllers/reservation.controller.js';

import { Router } from 'express';
import { validateLoggedIn } from '../controllers/user.controller.js';

const reservationRoutes = (app) => {

  const router = new Router();

  // get all available trip dates
  router.get(
    '/trip_dates',
    validateLoggedIn,
    getAllTrips,
    getAtCapacityTrips,
    getUserTrips,
    getAvailableTripDates
  );

  // create new reservation for the current user
  router.post(
    '/create',
    validateLoggedIn,
    validateTripDateExists,
    getAllTrips,
    validateTripDateIsValid,
    getSeatsByTrip,
    getOtherSeats,
    getUserSeats,
    validateSeatSelection,
    create
  );

  // get all reservations for the current user
  router.get(
    '/',
    validateLoggedIn,
    getAllUserReservations,
    getAllUserSeats,
    getAllReservationsInfo
  );

  // delete
  router.post(
    '/delete',
    validateLoggedIn,
    validateReservationIdExists,
    validateReservationOwnership,
    deleteReservation
  );

  router.post(
    '/seats',
    validateLoggedIn,
    validateTripDateExists,
    getAllTrips,
    validateTripDateIsValid,
    getSeatsByTrip,
    getUserSeats,
    getOtherSeats,
    getSeats
  );

  app.use('/api/reservation', router);
};

export default reservationRoutes;
