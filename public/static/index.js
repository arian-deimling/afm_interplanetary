'use strict';

$(() => {
  
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState == 4) {

        // user is logged in
        if (xmlHttp.status == 200) {
          $('#login-link').attr('hidden', 'true');
          $('#signup-link').attr('hidden', 'true');

        // user is not logged in
        } else if (xmlHttp.status == 400) {
          $('#reservation-link').attr('hidden', 'true');
          $('#logout-link').attr('hidden', 'true');
        }
      }
  }
  xmlHttp.open('GET', '/api/login', true);
  xmlHttp.send(null);

});