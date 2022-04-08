'use strict';

function makeAvailability(dates) {
	// convert available dates to map
	const availableDates = dates;
	const datesKeyVal = availableDates.map(date => [date, true]);
	const datesMap = new Map(datesKeyVal);

	// return fuction that returns true if date key in the map is truthy
	return date => {
		const testDate = date;
		if (datesMap.get(testDate.toISOString().substring(0, 10))) {
			return [true, '', 'available'];
		}
		return [false, '', 'unavailable'];
	}
}

function handlePassengerSelectChange() {
	$('#num_passengers').css('flex', '1 1 auto');
	// if number of passengers is selected display label
	if ($('#num_passengers').val() == '0') {
		$('label[for=num_passengers]').attr('hidden', 'true');
	} else {
		$('label[for=num_passengers]').removeAttr('hidden');
	}
}

function checkSeats() {
	const selectedSeats = $('form').serializeArray().filter(x => x.name.length === 2);
	const numPassengers = $('form').serializeArray().filter(x => x.name === 'num_passengers')[0];
	if (selectedSeats.length == numPassengers.value) {
		$('input[type=submit]')[0].setCustomValidity('');
		$('input[type=submit]')[0].reportValidity();
		checkNumPassengers();
	} else {
		$('#num_passengers')[0].setCustomValidity('Number of selected seats must match number from passenger selection.');
		$('#num_passengers')[0].reportValidity();
		setTimeout(() => {
			$('#num_passengers')[0].setCustomValidity('');
			$('#num_passengers')[0].reportValidity();
		}, 2000);
	}
	return selectedSeats.length == numPassengers.value;
}

async function getAndShowCapacity() {
	$.post('/api/reservation/capacity', $('form').serialize(), (res) => {
		// calculate total number of seats user can select
		const capacity = res.remaining_capacity + res.currentReservedSeats;

		// empty the passenger selection element and add a default value
		$('#num_passengers').empty();
		$('#num_passengers').append($('<option>').prop('value', '0').html('Select Number of Passengers'));

		// add number of passenger selection options
		for (let i = 1; i <= capacity; i++) {
			$('#num_passengers').append($('<option>').prop('value', `${i}`).html(`${i}`));
		}

		// if the user already has a reservation for this trip
		if (res.currentReservedSeats !== 0) {
			// set the selection value to current number of passengers for the user
			$(`option[value=${res.currentReservedSeats}]`).attr('selected', true);
			handlePassengerSelectChange();
			showById('editing_msg');
			$('h2').html('Edit Reservation');
			$(':submit').attr('value', 'Modify');
			createSeatSelection();
		} else {
			deleteSeatSelection();
			handlePassengerSelectChange();
			$('h2').html('New Reservation');
			$(':submit').attr('value', 'Submit');
			hideById('editing_msg');
		}
		showById('num_passengers');
	})
	.fail((res) => {
		if (res.status === 400) {
			$(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
			$(`#${res.responseJSON.what}`)[0].reportValidity();
			return;
		}
	});
}

function deleteSeatSelection() {
	$('#seat_selection_container').empty();
}

async function createSeatSelection() {

	deleteSeatSelection();

	if (!checkTripDate() || !checkNumPassengers()) {
		return;
	}

	$.post('/api/reservation/seats', $('form').serialize(), (res) => {

		const rows = 3;
		const columns = 4;
	
		const seatSelectContainer = $('#seat_selection_container').addClass('flex-rows').css('margin-bottom', '2rem');
		const seatSelectSubContainer = $('<div>').css('width', 'fit-content');
		const front = $('<div>').attr('id', 'front').attr('class', 'flex-cols');
		const back = $('<div>').attr('id', 'back').attr('class', 'flex-cols');
		const table = $('<table>');
		const tbody = $('<tbody>');
		table.append(tbody);
	
		front.append($('<h3>').attr('class', 'black-text').css('padding', '5rem 2rem').html('Cockpit'))
			.css('border', '3px solid gray')
			.css('border-top-right-radius', '50% 90%')
			.css('border-top-left-radius', '50% 90%');
		
		back.css('border', '3px solid gray').css('border-top', '0');
	
		for (let r = 0; r < rows; r++) {
			const row = $('<tr>');
			for (let c = 0; c < columns; c++) {
				const data = $('<td>');
				const rowLetter = String.fromCharCode(65 + r);
				const id = `${rowLetter}${c + 1}`
				const input = $('<input>').attr('type', 'checkbox').attr('id', id).attr('name', id);
				const label = $('<label>').attr('for', id);

				// if the user already has this seat selected
				if (res.userSeats.includes(id)) {
					input.attr('checked', 'true');
					label.html(id);
				}
				// if another user already has this seat selected
				if (res.otherSeats.includes(id)) {
					input.attr('disabled', 'true');
					label.html('X');
				}
				label.html(id);

				data.append(input);
				data.append(label);
				row.append(data);
				if (r === 0 && c === columns / 2 - 1) {
					row.append($('<td>').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'))
				}
				if (r !== 0 && c === columns / 2 - 1) {
					row.append($('<td>'));
				}
			}
			tbody.append(row);
		}
		back.append(table);
		seatSelectSubContainer.append(front).append(back);
		seatSelectContainer.append($('<div>').css('width', '100%'));
		seatSelectContainer.append(seatSelectSubContainer);
		seatSelectContainer.append($('<div>').css('width', '100%'));
	})
	.fail((res) => {
		// if login status error occurs, notify user and redirect to login page
		if (res.status === 400 && res.responseJSON.what == 'login_status') {
			alert('Your session has expired. Please log in again to continue!');
			window.location.replace('/login');
			return;
		}
		if (res.status === 400 && res.responseJSON.what == 'trip_date') {
			getAndShowCapacity();
		}
		if (res.status === 400) {
			$(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
			$(`#${res.responseJSON.what}`)[0].reportValidity();
			return;
		}
		// TODO(AD) - redirect to error page
		alert('Invalid response from the sever.');
	});
}

$(() => {

	// if a reservation was selected via query params autofill date
	// and disable date selection
	const queryParams = new URLSearchParams(window.location.search);
	const date = queryParams.get('date');
	if (date !== null) {
		$('#trip_date').val(`${date.split('-')[1]}/${date.split('-')[2]}/${date.split('-')[0]}`);
		$('#trip_date').attr('readonly', 'readonly');
		getAndShowCapacity();
	}

	showById('home-link', 'about-link', 'logout-link', 'reservation-view-link');

	// check login every 5 sec and redirect to login
	// page is user becomes logged out
	loginCheck();

	// force user to select date from calendar instead of keyboard
	$('#trip_date').on('keydown', (e) => {
		e.preventDefault();
		$('#trip_date')[0].setCustomValidity('Use calendar to select trip date.');
		$('#trip_date')[0].reportValidity();
		setTimeout(() => {
			$('#trip_date')[0].setCustomValidity('');
			$('#trip_date')[0].reportValidity();
			$('#trip_date').trigger('blur');
		}, 1500);
	});

	// validate num_passengers selection on field change
	$('#num_passengers').on('change', () => {
		const validPassengers = checkNumPassengers();
		handlePassengerSelectChange();
		if (validPassengers) {
			createSeatSelection();
		} else {
			deleteSeatSelection();
		}
	});

	$('form').on('submit', (e) => {
		e.preventDefault();

		// make sure valid input exists; otherwise, do not make request to server
		if (!checkNumPassengers() || !checkTripDate() || !checkSeats()) {
			return;
		}

		$.post('/api/reservation/create', $('form').serialize(), (res) => {
			// on success response, redirect to view reservation page
			window.location.replace('/reservation/view');
		})
		// handle non-success response codes
		.fail((res) => {
			console.log(res);
			// if login status error occurs, notify user and redirect to login page
			if (res.status === 400 && res.responseJSON.what == 'login_status') {
				alert('Your session has expired. Please log in again to continue!');
				window.location.replace('/login');
				return;
			}
			if (res.status === 400 && res.responseJSON.what == 'trip_date') {
				getAndShowCapacity();
			}
			if (res.status === 400) {
				$(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
				$(`#${res.responseJSON.what}`)[0].reportValidity();
				return;
			}
			// TODO(AD) - redirect to error page
			alert('Invalid response from the sever.');
		});
	});

	let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status === 200) {
				// create a function that returns true when available date is passed to
				// it; sort the list of dates
				const available = makeAvailability(xmlHttp.response);
				xmlHttp.response.sort((a, b) => { return a.localeCompare(b); });

				// get the oldest and newest dates
				let minDate;
				let maxDate;
				if (xmlHttp.response.length > 0) {
					minDate = xmlHttp.response.slice(0, 1)[0];
					maxDate = xmlHttp.response.slice(-1)[0];

					// ['YYYY', 'MM', 'DD']
					const minDateSplit = minDate.split('-');
					const maxDateSplit = maxDate.split('-');

					// change format
					minDate = `${minDateSplit[1]}/${minDateSplit[2]}/${minDateSplit[0]}`;
					maxDate = `${maxDateSplit[1]}/${maxDateSplit[2]}/${maxDateSplit[0]}`;
				}
				// set up date picker unless we are editing a specific reservation
				if (date === null) {
					$('#trip_date').datepicker({
						beforeShowDay: available,
						minDate: minDate,
						maxDate: maxDate,
						onSelect: _ => {
							getAndShowCapacity();
						},
					});
				}

			}
		}
  }
  xmlHttp.open('GET', '/api/reservation/trip_dates', true);
	xmlHttp.responseType = 'json';
  xmlHttp.send(null);
});

// INSERT INTO seats (seat, reservation_id) VALUES
// 	('A1', 2),
// 	('A2', 2),
// 	('A3', 2),
// 	('A4', 2),
// 	('B1', 2),
// 	('B2', 2),
// 	('B3', 2),
// 	('B4', 2),
// 	('A1', 4),
// 	('A2', 4),
// 	('A3', 4),
// 	('A4', 4),
// 	('B1', 4),
// 	('B2', 4),
// 	('A1', 7),
// 	('B3', 10),
// 	('B4', 10),
// 	('C1', 10),
// 	('C2', 10),
// 	('C3', 10),
// 	('C4', 10);