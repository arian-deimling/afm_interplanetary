'use strict';

$(() => {

  // hide home link if we are on the home page
  if (window.location.pathname === '/') {
    hideById('home-link');
  }
  // hide about link if we are on the about page
  if (window.location.pathname === '/about') {
    hideById('about-link');
  }
  
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState == 4) {

        // user is logged in
        if (xmlHttp.status == 200) {
          hideById('login-link', 'signup-link');

        // user is not logged in
        } else if (xmlHttp.status == 400) {
          hideById('reservation-link', 'logout-link');
        }
      }
  }
  xmlHttp.open('GET', '/api/login', true);
  xmlHttp.send(null);

});