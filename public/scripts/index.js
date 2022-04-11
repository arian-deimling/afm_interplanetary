import {
  checkUserLoggedIn,
  reloadOnLoginChange,
  showById
} from './util.js';

$(() => {
  let userLoggedIn = false;

  if (window.location.pathname !== '/') {
    showById('home-link');
    return;
  }
  showById('about-link');

  // check if user is logged in a display appropriate headers
  checkUserLoggedIn().then((loggedIn) => {
    // show appropriate links based on whether the user is logged in
    if (loggedIn) {
      showById('reservation-view-link', 'reservation-link', 'logout-link');
      userLoggedIn = true;
    } else {
      showById('login-link', 'signup-link');
      userLoggedIn = false;
    }
    reloadOnLoginChange(userLoggedIn);

  }).catch(() => {
    window.location.replace('/500');
  });


});
