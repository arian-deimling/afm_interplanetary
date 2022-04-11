'use strict';

$(() => {

  const usernameInput = new UsernameInput(
		$('#username_field_container'),
		usernameRegex,
    'Username must be between 8 and 20 characters long and contain only numbers'
    + 'and/or letters.'
  );

	const passwordInput = new PasswordInput(
		$('#password_field_container'),
		passwordRegex,
    'Password must be between 8 and 20 characters and contain one uppercase'
    + ' letter, one lowercase letter, one numner, and no special characters.'
  );

  const passwordConfirmInput = new PasswordConfirmInput(
    $('#password_confirm_field_container'),
    passwordInput,
    'Password confirmation must match passsword.'
  );

  const securityQuestionInput = new SecurityQuestionInput(
    $('#security_question_container'),
    'Select a security question...',
    'You must select a security question.'
  );
  
  const securityQuestionAnswerInput = new SecurityQuestionAnswerInput(
    $('#security_question_answer_container'),
    securityQuestionAnswerRegex,
    'Security Question Answer must be between 1 and 99 characters.',
  )

  showById('home-link', 'login-link');

  // redirect the user if the user becomes logged in while viewing the page
  forceNotLoggedIn();

  // get security questions and add them to the form
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onload = () => {
    if (xmlHttp.status === 200) {
      xmlHttp.response.forEach(({ id, question }) => {
        $('select').append($('<option>').attr('value', id).html(question));
      });
      return;
    }
    window.location.replace('/500');
  }
  xmlHttp.open('GET', '/api/security_questions', true);
  xmlHttp.responseType = 'json';
  xmlHttp.send(null);

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
    if (!passwordConfirmInput.checkValidity()) {
      passwordConfirmInput.reportValidity();
      return;
    }
    if (!securityQuestionInput.checkValidity()) {
      securityQuestionInput.reportValidity();
      return;
    }
    if (!securityQuestionAnswerInput.checkValidity()) {
      securityQuestionAnswerInput.reportValidity();
      return;
    }

    $.post('/api/signup', $('form').serialize(), (res) => {
      // on success response, redirect to login page
      window.location.replace('/login');
    })
    // handle non-success response codes
    .fail((res) => {
      if (res.status === 400) {
        if (usernameInput.handleServerResponse(res.responseJSON)) {
          return;
        }
        if (passwordInput.handleServerResponse(res.responseJSON)) {
          return;
        }
        if (passwordConfirmInput.handleServerResponse(res.responseJSON)) {
          return;
        }
        if (securityQuestionInput.handleServerResponse(res.responseJSON)) {
          return;
        }
        if (securityQuestionAnswerInput.handleServerResponse(res.responseJSON)) {
          return;
        }
      }
      window.location.replace('/500');
    });
  });
});
