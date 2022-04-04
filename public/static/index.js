'use strict';

$(() => {

  hideById('home-link');
  
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