const { route } = require('express/lib/application');

const userRoutes = app => {

  const user_controller = require('../controllers/user.controller');
  let router = require('express').Router();

  // create a new user
  router.post("/signup", user_controller.create);

  // login the user
  router.post("/login", user_controller.login);

  // check the user's login status
  router.get('/login', user_controller.checkLogin);

  // log the user out
  router.get('/logout', user_controller.logout);

  // get security question for a user
  router.post('/finduser', user_controller.findUser);

  // update a user's password
  router.post('/reset', user_controller.resetPassword);

  app.use('/api', router);
};

module.exports = userRoutes;
