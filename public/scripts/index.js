'use strict';

$(() => {

  let userLoggedIn;

  // hide home link if we are on the home page
  if (window.location.pathname === '/') {
    showById('about-link');
    // check if user is logged in a display appropriate headers
    checkUserLoggedIn()
    .then((loggedIn) => {
      if (loggedIn) {
        if (window.location.pathname === '/') {
          showById('reservation-view-link', 'reservation-link', 'logout-link');
        }
        userLoggedIn = true;
      } else {
        if (window.location.pathname === '/') {
          showById('login-link', 'signup-link');
        }
        userLoggedIn = false;
      }
      // start checking login status periodically for changes
      window.setInterval(async () => {
        // get the login api request status code
        let loggedIn;
        try {
          loggedIn = await checkUserLoggedIn();
        } catch (err) {
          // TODO(AD) - need to do something better here
          console.log(err);
          return;
        }
        // if we don't know login status, set it
        if (userLoggedIn === undefined) {
          userLoggedIn = loggedIn;
          return;
        }
        // if login status changed, reload the page
        const loginStatuChanged = (userLoggedIn != loggedIn)
        if (loginStatuChanged) {
          location.reload();
        }
      }, 2500);
    }).catch((err) => {
      window.location.replace('/500');
    })
  }
  // hide about link if we are on the about page
  else {
    showById('home-link');
  }

});