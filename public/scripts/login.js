'use strict';

$(() => {

	const usernameInput = new UsernameInput(
		$('#username_field_container'),
		existsRegex,
		'Username is required.'
	);

	const passwordInput = new PasswordInput(
		$('#password_field_container'),
		existsRegex,
		'Password is required.'
	);

	showById('home-link', 'signup-link');

	// redirect the user if the user becomes logged in while viewing the page
	forceNotLoggedIn();

	$('form').on('submit', (event) => {
		event.preventDefault();

		// validate inputs
		if (!usernameInput.checkValidity()) {
			usernameInput.reportValidity();
			return;
		}
		if (!passwordInput.checkValidity()) {
			passwordInput.reportValidity();
			return;
		}


		$.post('/api/login', $('form').serialize(), (res) => {
			// on success response, redirect to login page
			window.location.replace('/');
		})
		// handle non-success response codes
		.fail((res) => {
			if (res.status == 400) {
        if (usernameInput.handleServerResponse(res.responseJSON)) {
          return;
        }
        if (passwordInput.handleServerResponse(res.responseJSON)) {
          return;
        }
			}
			window.location.replace('/500');
		});
	});
});
