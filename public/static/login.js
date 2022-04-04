"use strict";

$(() => {

  $('#username').on('keyup', () => {
    $('#username')[0].setCustomValidity('');
    $('#username')[0].reportValidity();
  });

  $('#password').on('keyup', () => {
    $('#password')[0].setCustomValidity('');
    $('#password')[0].reportValidity();
  });

	$('form').on('submit', (event) => {
		event.preventDefault();
		
		$.post('/api/login', $('form').serialize(), (res) => {
			// on success response, redirect to login page
			window.location.replace('/');
		})
		// handle non-success response codes
		.fail((res) => {
			if (res.status == 400) {
        $(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
        $(`#${res.responseJSON.what}`)[0].reportValidity();
			} else {
				alert('Invalid response from the server.');
			}
		});
	});
});
