'use strict';

// handle click of delete button
function deleteButton(anchor) {
  $.post('/api/reservation/delete', {id: anchor.attr('value')}, (res) => {
    anchor.parent().parent().attr('hidden', '');
  })
  .fail((res) => {
    alert('Error: Unable to delete reservation');
    console.log(res);
  });
}

class ReservationView {
  constructor(reservationTable) {
    this.table = reservationTable;
  }

  add(reservation) {
    // unpack reservation data
    const { id, num_passengers, createdAt, updatedAt, trip_date, seats } = reservation;

    // create a new row
    const row = $('<tr>');
    let tableEntry;

    // add date table entry to the table
    let tripDate = parseDateLocalTimezone(trip_date);
    tripDate = tripDate.toLocaleDateString('en-US', { dateStyle: 'full' });
    tableEntry = $('<td>').html(tripDate);
    row.append(tableEntry);

    // number of passengers and selected seats
    tableEntry = $('<td>').html(`${num_passengers}<hr>${seats.join(' ')}`);
    row.append(tableEntry);
    
    // reservation creation datetime
    let timestamp = new Date(createdAt);
    timestamp = timestamp.toLocaleString('en-US', { timeZoneName: 'short' })
    timestamp = timestamp.replace(', ', '<br>');
    tableEntry = $('<td>').html(timestamp);
    row.append(tableEntry);

    // reservation modificiation datetime
    timestamp = new Date(createdAt);
    timestamp = timestamp.toLocaleString('en-US', { timeZoneName: 'short' })
    timestamp = timestamp.replace(', ', '<br>');
    tableEntry = $('<td>').html(timestamp);
    row.append(tableEntry);

    // reservation edit link
    let link = $('<a>').attr('href', `/reservation?date=${trip_date}`).html('Edit');
    tableEntry = $('<td>').append(link);
    row.append(tableEntry);

    // reservation delete link
    link = $('<a>').attr('value', `${id}`).attr('href', '').html('Delete');
    link.on('click', (e) => {
      e.preventDefault();
      deleteButton(link);
    });
    tableEntry = $('<td>').append(link);
    row.append(tableEntry);

    // add the row to the table
    this.table.append(row);
  }

  addAll(reservationArray) {
    reservationArray.sort((a, b) => {
      return a.trip_date < b.trip_date ? -1 : 1;
    });
    for (const reservation of reservationArray) {
      this.add(reservation);
    }
  }

  show() {
    this.table.removeAttr('hidden');
  }

  hide() {
    this.table.attr('hidden', 'true');
  }
}

$(() => {
  // create the reservation view 
  let reservationView = new ReservationView($('#reservation_display'));

  $('form').css('width', '80%');
	showById('home-link', 'logout-link', 'reservation-link');
  loginCheck();

  // request user's reservations from the server
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
        // if there are reservations add them to the reservation view
        reservationView.addAll(xmlHttp.response);
        reservationView.show();        
			}
		}
  }
  xmlHttp.open('GET', '/api/reservation', true);
	xmlHttp.responseType = 'json';
  xmlHttp.send(null);

});
