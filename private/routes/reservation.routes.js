'use strict';

import { Router } from 'express';

import reservationController from '../controllers/reservation.controller.js';

const reservationRoutes = app => {

  let router = Router();

  // get all trip dates
  router.get('/trip_dates', reservationController.getTripDates);

  router.post('/capacity', reservationController.getRemainingCapacity);

  router.post('/create', reservationController.create);

  router.get('/', reservationController.allReservations);

  router.post('/delete', reservationController.deleteReservation);

  router.post('/seats', reservationController.getSeats);

  app.use('/api/reservation', router);
};

export default reservationRoutes;
