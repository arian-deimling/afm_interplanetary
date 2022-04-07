'use strict';

function parseDateLocalTime(dateString) {
	// TODO(AD) - fix hardcoded
	return new Date(`${dateString}T00:00:00.000-04:00`);
}

function makeAvailability(dates) {
	// convert available dates to map
	const availableDates = dates;
	const datesKeyVal = availableDates.map(({ date }) => [date, true]);
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

async function getAndShowCapacity() {
	$.post('/api/reservation/capacity', $('form').serialize(), (res) => {
		$('#num_passengers').empty();
		$('#num_passengers').append($('<option>').prop('value', '0').html('Select Number of Passengers'));
		for (let i = 1; i <= res.remaining_capacity; i++) {
			$('#num_passengers').append($('<option>').prop('value', `${i}`).html(`${i}`));
		}
		showById('num_passengers');
	})
	.fail((res) => {
		if (res.status === 400) {
			$(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
			$(`#${res.responseJSON.what}`)[0].reportValidity();
			return;
		}
		console.log(res.responseText);
	});
}

$(() => {

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
		checkNumPassengers();
		$('#num_passengers').css('flex', '1 1 auto');
		// if number of passengers is selected display label
		if ($('#num_passengers').val() == '0') {
			$('label[for=num_passengers]').attr('hidden', 'true');
		} else {
			$('label[for=num_passengers]').removeAttr('hidden');
		}
	});

	$('form').on('submit', (e) => {
		e.preventDefault();

		// make sure valid input exists; otherwise, do not make request to server
		if (!checkNumPassengers() || !checkTripDate()) {
			return;
		}

		$.post('/api/reservation/create', $('form').serialize(), (res) => {
			// on success response, redirect to view reservation page
			window.location.replace('/reservation/view');
		})
		// handle non-success response codes
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
	});

	let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status === 200) {
				// create a function that returns true when available date is passed to
				// it; sort the list of dates
				const available = makeAvailability(xmlHttp.response);
				xmlHttp.response.sort((a, b) => { return a.date.localeCompare(b.date); });

				// get the oldest and newest dates
				let minDate;
				let maxDate;
				if (xmlHttp.response.length > 0) {
					minDate = xmlHttp.response.slice(0, 1)[0].date;
					maxDate = xmlHttp.response.slice(-1)[0].date;

					// ['YYYY', 'MM', 'DD']
					const minDateSplit = minDate.split('-');
					const maxDateSplit = maxDate.split('-');

					// change format
					minDate = `${minDateSplit[1]}/${minDateSplit[2]}/${minDateSplit[0]}`;
					maxDate = `${maxDateSplit[1]}/${maxDateSplit[2]}/${maxDateSplit[0]}`;
				}
				// set ip date picker
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
  xmlHttp.open('GET', '/api/reservation/trip_dates', true);
	xmlHttp.responseType = 'json';
  xmlHttp.send(null);
});