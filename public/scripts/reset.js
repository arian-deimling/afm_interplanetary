'use strict';

$(() => {

  const usernameInput = new UsernameInput(
		$('#username_field_container'),
		existsRegex,
    'Username is required.'
  );

	const passwordInput = new PasswordInput(
		$('#password_field_container'),
		passwordRegex,
    'Password must be between 8 and 20 characters and contain one uppercase'
    + ' letter, one lowercase letter, one numner, and no special characters.'
  );
	passwordInput.hide();

  const passwordConfirmInput = new PasswordConfirmInput(
    $('#password_confirm_field_container'),
    passwordInput,
    'Password confirmation must match passsword.'
  );
	passwordConfirmInput.hide();

  const securityQuestionInput = new SecurityQuestionInput(
    $('#security_question_container'),
    'Select a security question...',
    'You must select a security question.'
  );
	securityQuestionInput.hide();
  
  const securityQuestionAnswerInput = new SecurityQuestionAnswerInput(
    $('#security_question_answer_container'),
    securityQuestionAnswerRegex,
    'Security Question Answer must be between 1 and 99 characters.',
  );
	securityQuestionAnswerInput.hide();

	hideById('show-pass', 'show-pass-label');

	showById('home-link', 'signup-link', 'login-link');

	forceNotLoggedIn();

	$('form').on('submit', (event) => {
		event.preventDefault();

		// if we are at the stage of retrieving the security question for this user
		if (!($('#submit-user').attr('hidden'))) {

			if (!usernameInput.checkValidity()) {
				usernameInput.reportValidity();
				return;
			}
					
			// find the user
			$.post('/api/finduser', $('form').serialize(), res => {

				// hide old submit button
				hideById('submit-user');

				// set security question
				$('select > option').attr('value', `${res.security_question_id}`);
				$('select > option').html(res.security_question);
				$('select').attr('disabled', 'true');

				passwordInput.show();
				passwordConfirmInput.show();
				securityQuestionInput.show();
				securityQuestionAnswerInput.show();
				showById('show-pass', 'show-pass-label', 'submit-reset');

				$('input[name=username]').attr('readonly', 'readonly');

			})
			.fail(res => {
				if (res.status === 400) {
					if (usernameInput.handleServerResponse(res.responseJSON)) {
						return;
					}
				}
				window.location.replace('/500')
			});
		}

		// if we are at the stage of resetting the password for this user		
		if (!($('#submit-reset').attr('hidden'))) {

			if (!passwordInput.checkValidity()) {
				passwordInput.reportValidity();
				return;
			}
			if (!passwordConfirmInput.checkValidity()) {
				passwordConfirmInput.reportValidity();
				return;
			}
			if (!securityQuestionAnswerInput.checkValidity()) {
				securityQuestionAnswerInput.reportValidity();
				return;
			}

			$.post('/api/reset', $('form').serialize(), res => {
				// on success response, redirect to login page
				window.location.replace('/login');
			})
			.fail((res, status, err) => {
				if (passwordInput.handleServerResponse(res.responseJSON)) {
					return;
				}
				if (passwordConfirmInput.handleServerResponse(res.responseJSON)) {
					return;
				}
				if (securityQuestionAnswerInput.handleServerResponse(res.responseJSON)) {
					return;
				}
				window.location.replace('/500')
			});
		}
	});
});
