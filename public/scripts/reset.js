'use strict';

$(() => {

	hideById('show-pass', 'show-pass-label');

	showById('home-link', 'signup-link', 'login-link')

	// validate password and password verify upon each keypress
	$('#password').on('keyup', () => {
		checkPassword();
	});
	$('#pass_verify').on('keyup', () => {
		checkPassVerify();
	});

	// unset validity if username or security question answer are changed
  $('#username').on('keyup', (e) => {
		if (e.key !== 'Enter') {
			$('#username')[0].setCustomValidity('');
			$('#username')[0].reportValidity();
		}
  });
	$('#security_question_answer').on('keyup', (e) => {
		if (e.key !== 'Enter') {
			$('#security_question_answer')[0].setCustomValidity('');
			$('#security_question_answer')[0].reportValidity();
		}
	});

	$('form').on('submit', (event) => {
		event.preventDefault();

		// if we are at the stage of retrieving the security question for this user
		if (!($('#submit-user').attr('hidden'))) {

			if (!checkUsernameExists()) {
				return;
			}	
					
			// find the user
			$.post('/api/finduser', $('form').serialize(), res => {

				// hide old submit button
				hideById('submit-user');

				// set security question
				$('#security_question_id > option').attr('value', `${res.security_question_id}`);
				$('#security_question_id > option').html(res.security_question);

				// show hidden form elements
				showById(
					'security_question_id', 'security_question_answer', 'password',
					'pass_verify', 'submit-reset', 'show-pass', 'show-pass-label'
				);

				$('#username').attr('readonly', 'readonly');

			})
			.fail(res => {
				if (res.status === 400) {
					$(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
					$(`#${res.responseJSON.what}`)[0].reportValidity();
				} else {
					window.location.replace('/500')
				}
			});
		}

		// if we are at the stage of resetting the password for this user		
		if (!($('#submit-reset').attr('hidden'))) {

			if (!checkUsernameExists() || !checkSecurityQuestionAnswerExists()
					|| !checkPassword() || !checkPassVerify()) {

				return;
			}	

			$.post('/api/reset', $('form').serialize(), res => {
				// on success response, redirect to login page
				window.location.replace('/login');
			})
			.fail((res, status, err) => {
				if (res.status === 400) {
					$(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
					$(`#${res.responseJSON.what}`)[0].reportValidity();
				} else {
					window.location.replace('/500')
				}
			});
		}
	});
});
