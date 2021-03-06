/* eslint-disable no-alert */

import {
  forceLoggedIn,
  parseDateLocalTimezone,
  showById
} from './util.js';

// handle click of delete button
function deleteButton(anchor) {
  $.post('/api/reservation/delete', { id: anchor.attr('value'), }, () => {
    anchor.parent().parent().remove();
    if ($('tbody tr').length === 0) {
      $('#reservation_display').attr('hidden', '');
      $('#no_reservation').removeAttr('hidden');
    }
  }).fail(() => {
    alert('Error: Unable to delete reservation.');
  });
}

class ReservationView {
  constructor(reservationTable) {
    this.table = reservationTable;
    this.body = this.table.find('tbody');
  }

  add(reservation) {
    // unpack reservation data
    const { id, num_passengers, createdAt, trip_date, seats, } = reservation;

    // create a new row
    const row = $('<tr>');

    // add date table entry to the table
    let tripDate = parseDateLocalTimezone(trip_date);
    tripDate = tripDate.toLocaleDateString('en-US', { dateStyle: 'full', });
    let tableEntry = $('<td>').html(tripDate);
    row.append(tableEntry);

    // number of passengers and selected seats
    tableEntry = $('<td>').html(`${num_passengers}<hr>${seats.join(' ')}`);
    row.append(tableEntry);

    // reservation creation datetime
    let timestamp = new Date(createdAt);
    timestamp = timestamp.toLocaleString('en-US', { timeZoneName: 'short', });
    timestamp = timestamp.replace(', ', '<br>');
    tableEntry = $('<td>').html(timestamp);
    row.append(tableEntry);

    // reservation modificiation datetime
    timestamp = new Date(createdAt);
    timestamp = timestamp.toLocaleString('en-US', { timeZoneName: 'short', });
    timestamp = timestamp.replace(', ', '<br>');
    tableEntry = $('<td>').html(timestamp);
    row.append(tableEntry);

    // reservation edit link
    let link = $('<a>').attr('href', `/reservation?date=${trip_date}`).
      html('Edit');
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
    this.body.append(row);
  }

  addAll(reservationArray) {
    reservationArray.sort((a, b) => {
      if (a.trip_date < b.trip_date) {
        return -1;
      }
      return 1;
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
  const reservationView = new ReservationView($('#reservation_display'));

  $('form').css('width', '80%');
  showById('home-link', 'logout-link', 'reservation-link');
  forceLoggedIn();

  // request user's reservations from the server
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.addEventListener('load', () => {
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
    } else {
      window.location.replace('/500');
    }
  });
  xmlHttp.open('GET', '/api/reservation', true);
  xmlHttp.responseType = 'json';
  xmlHttp.send(null);

});
