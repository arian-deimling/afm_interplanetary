'use strict';

$(() => {

  let userLoggedIn;

  // hide home link if we are on the home page
  if (window.location.pathname === '/') {
    showById('about-link');
  }
  // hide about link if we are on the about page
  if (window.location.pathname === '/about') {
    showById('home-link');
  }

  // check if user is logged in a display appropriate headers
  checkUserLoggedIn()
  .then((loggedIn) => {
    if (loggedIn) {
      showById('reservation-view-link', 'reservation-link', 'logout-link');
      userLoggedIn = true;
    } else {
      showById('login-link', 'signup-link');
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
    // TODO(AD) - probably need to do something better here
    console.log(`unexpected response code ${err.code} - ${err.message}`);
  })
  
  // let xmlHttp = new XMLHttpRequest();
  // xmlHttp.onreadystatechange = () => {
  //     if (xmlHttp.readyState == 4) {

  //       // user is logged in
  //       if (xmlHttp.status == 200) {
  //         showById('reservation-view-link', 'reservation-link', 'logout-link');

  //       // user is not logged in
  //       } else if (xmlHttp.status == 400) {
  //         showById('login-link', 'signup-link');
  //       }
  //     }
  // }
  // xmlHttp.open('GET', '/api/login', true);
  // xmlHttp.send(null);

});