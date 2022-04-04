"use strict";

const checkPassword = () => {
	const passwordInput = $('#password');
	if (!passwordRegex.test(passwordInput.val())) {
		passwordInput[0].setCustomValidity(
			'Password must be between 8 and 20 characters and contain one uppercase letter, one lowercase letter, one numner, and no special characters.'
		);
		passwordInput[0].reportValidity();
		return false;
	} else {
		passwordInput[0].setCustomValidity('');
		passwordInput[0].reportValidity();
		return true;
	}
}

const checkPassVerify = () => {
	const passwordInput = $('#password');
	const passwordVerifyInput = $('#pass_verify');
	if (passwordVerifyInput.val() != passwordInput.val()) {
		passwordVerifyInput[0].setCustomValidity(
			'Password confirmation must match passsword.'
		);
		passwordVerifyInput[0].reportValidity();
		return false;
	} else {
		passwordVerifyInput[0].setCustomValidity('');
		passwordVerifyInput[0].reportValidity();
		return true;
	}
}

$(() => {

	hideById('reservation-link', 'logout-link');

  $('#username').on('keyup', () => {
    $('#username')[0].setCustomValidity('');
    $('#username')[0].reportValidity();
  });

	$('form').on('submit', (event) => {
		event.preventDefault();

		// if we are at the stage of retrieving the security question for this user
		if ($('input:submit').attr('value') === 'Submit') {
			
			$.post('/api/finduser', $('form').serialize(), res => {

				$('input:submit').remove();

				const securityQuestion = '<select id=security_question_id name=security_question_id disabled>'
					+ `<option value=${res.security_question_id}>${res.security_question}</option>`
				  + '</select>';
				const securityQuestionAnswer = '<input id=security_question_answer type=text name=security_question_answer placeholder="Security Question Answer">'
				const passwordInput = '<input id=password type=password name=password placeholder="Choose New Password">'
        const passVerifyInput = '<input id=pass_verify type=password name=pass_verify placeholder="Confirm New Password">'
				const submitButton = '<input id=submit-login type=submit value="Reset Password" on>'

				$('form').append(securityQuestion, securityQuestionAnswer, passwordInput, passVerifyInput, submitButton);

				// validate password input
				$('#password').on('keyup', () => {
					checkPassword();
				});

				// validate confirm password input
				$('#pass_verify').on('keyup', () => {
					checkPassVerify();
				});

				$('#security_question_answer').on('keyup', () => {
					$('#security_question_answer')[0].setCustomValidity('');
					$('#security_question_answer')[0].reportValidity();
				});

			})
			.fail(res => {
				$(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
				$(`#${res.responseJSON.what}`)[0].reportValidity();
			});
		}

		// if we are at the stage of resetting the password for this user		
		if ($('input:submit').attr('value') === 'Reset Password') {

			if (!(checkPassword() && checkPassVerify())) {
				return;
			}	

			$.post('/api/reset', $('form').serialize(), res => {
				// on success response, redirect to login page
				window.location.replace('/login');
			})
			.fail(res => {
				$(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
				$(`#${res.responseJSON.what}`)[0].reportValidity();
			});
		}
	});
});
