const reservationRoutes = app => {

  const reservationController = require('../controllers/reservation.controller');
  let router = require('express').Router();

  // get all trip dates
  router.get('/trip_dates', reservationController.getTripDates);

  router.post('/capacity', reservationController.getRemainingCapacity);

  router.post('/create', reservationController.create);

  app.use('/api/reservation', router);
};

module.exports = reservationRoutes;
