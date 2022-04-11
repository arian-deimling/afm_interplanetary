import {
  PasswordConfirmInput,
  PasswordInput,
  SecurityQuestionAnswerInput,
  SecurityQuestionInput,
  UsernameInput,
  checkValidities,
  forceNotLoggedIn,
  handleServerResponseMany,
  hideById,
  passwordConfirmValidity,
  passwordValidity,
  securityQuestionAnswerExistsValidity,
  securityQuestionValidity,
  showById,
  usernameExistsValidity
} from './util.js';

import {
  existsRegex,
  passwordRegex,
  securityQuestionAnswerRegex
} from './config/validation.config.js';

$(() => {

  const usernameInput = new UsernameInput(
    $('#username_field_container'),
    existsRegex, usernameExistsValidity
  );

  const passwordInput = new PasswordInput(
    $('#password_field_container'),
    passwordRegex, passwordValidity
  );

  const passwordConfirmInput = new PasswordConfirmInput(
    $('#password_confirm_field_container'), passwordInput,
    passwordConfirmValidity
  );

  const securityQuestionInput = new SecurityQuestionInput(
    $('#security_question_container'), 'Select a security question...',
    securityQuestionValidity
  );

  const securityQuestionAnswerInput = new SecurityQuestionAnswerInput(
    $('#security_question_answer_container'), securityQuestionAnswerRegex,
    securityQuestionAnswerExistsValidity
  );

  passwordInput.hide();
  passwordConfirmInput.hide();
  securityQuestionInput.hide();
  securityQuestionAnswerInput.hide();

  hideById('show-pass', 'show-pass-label');
  showById('home-link', 'signup-link', 'login-link');

  forceNotLoggedIn();

  $('form').on('submit', (event) => {
    event.preventDefault();

    // if we are at the stage of retrieving the security question for this user
    if (!$('#submit-user').attr('hidden')) {
      handleSubmitUsername(
        usernameInput, passwordInput, passwordConfirmInput,
        securityQuestionInput, securityQuestionAnswerInput
      );
    }

    // if we are at the stage of resetting the password for this user
    if (!$('#submit-reset').attr('hidden')) {
      handleSubmitReset(
        passwordInput, passwordConfirmInput,
        securityQuestionAnswerInput
      );
    }
  });
});

function handleSubmitUsername(
  usernameInput, passwordInput,
  passwordConfirmInput, securityQuestionInput,
  securityQuestionAnswerInput
) {

  if (!usernameInput.checkValidity()) {
    usernameInput.reportValidity();
    return;
  }

  // find the user
  $.post('/api/finduser', $('form').serialize(), (res) => {

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

  }).fail((res) => {
    if (res.status === 400) {
      if (usernameInput.handleServerResponse(res.responseJSON)) {
        return;
      }
    }
    window.location.replace('/500');
  });
}

function handleSubmitReset(
  passwordInput, passwordConfirmInput,
  securityQuestionAnswerInput
) {

  // validate inputs
  const allValid = checkValidities(
    passwordInput, passwordConfirmInput,
    securityQuestionAnswerInput
  );
  if (!allValid) {
    return;
  }

  $.post('/api/reset', $('form').serialize(), () => {
    // on success response, redirect to login page
    window.location.replace('/login');
  }).fail((res) => {
    const handledResponse = handleServerResponseMany(
      res.responseJSON,
      passwordInput, passwordConfirmInput, securityQuestionAnswerInput
    );
    if (handledResponse) {
      return;
    }
    window.location.replace('/500');
  });
}
