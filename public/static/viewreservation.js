'use strict';

function parseDateLocalTime(_date) {
  // TODO(AD) - _date is a bad param name
  let date = new Date(_date);
  let utcDate = new Date(date.toLocaleString('en-US', { timeZone: "UTC" }));
  let tzDate = new Date(date.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  let offset = utcDate.getTime() - tzDate.getTime();

  date.setTime( date.getTime() + offset );

  return date;
}

$(() => {

  $('form').css('width', '75%');

	showById('home-link', 'about-link', 'logout-link', 'reservation-link');
  loginCheck();

  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status === 200) {

        // if there are no reservations for this user, only display 
        // link to create a reservation
        if (xmlHttp.response.length === 0) {
          $('#no_reservation').removeAttr('hidden');
          return;
        }

        // formatting options for dates and datetimes
        const dateFormat = {
          dateStyle: 'full',
        }
        const dateTimeFormat = {
          timeZoneName: 'short',
        }

        // sort the trips by date
        let userTrips = xmlHttp.response;
        userTrips.sort((a, b) => {
          return a.trip_date < b.trip_date ? -1 : 1;
        });
        
        // add a row to the table for each reservation
        for (const { id, num_passengers, createdAt, updatedAt, trip_date } of userTrips) {
          const row = $('<tr>')
          row.append($('<td>').html(parseDateLocalTime(trip_date).toLocaleDateString('en-US', dateFormat)));
          row.append($('<td>').html(num_passengers));
          row.append($('<td>').html(new Date(createdAt).toLocaleString('en-US', dateTimeFormat).replace(', ', '<br>')));
          row.append($('<td>').html(new Date(updatedAt).toLocaleString('en-US', dateTimeFormat).replace(', ', '<br>')));
          row.append($('<td>').append($('<a>').attr('href', `/reservation?date=${trip_date}`).html('Edit')));
          // TODO(AD) - implement delete
          row.append($('<td>').append($('<a>').attr('value', `${trip_date}`).attr('href', '').html('Delete')));
          $('#reservation_display').append(row);
        }
        // display the reservation table
        $('#reservation_display').removeAttr('hidden');
			}
		}
  }
  xmlHttp.open('GET', '/api/reservation', true);
	xmlHttp.responseType = 'json';
  xmlHttp.send(null);

});