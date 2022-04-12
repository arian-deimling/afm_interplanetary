import {
  PasswordConfirmInput,
  PasswordInput,
  SecurityQuestionAnswerInput,
  SecurityQuestionInput,
  UsernameInput,
  checkValidities,
  forceNotLoggedIn,
  handleServerResponseMany,
  passwordConfirmValidity,
  passwordValidity,
  securityQuestionAnswerValidity,
  securityQuestionValidity,
  showById,
  usernameValidity
} from './util.js';

import {
  passwordRegex,
  securityQuestionAnswerRegex,
  usernameRegex
} from './config/validation.config.js';

$(() => {

  const usernameInput = new UsernameInput(
    $('#username_field_container'),
    usernameRegex,
    usernameValidity
  );

  const passwordInput = new PasswordInput(
    $('#password_field_container'),
    passwordRegex,
    passwordValidity
  );

  const passwordConfirmInput = new PasswordConfirmInput(
    $('#password_confirm_field_container'),
    passwordInput,
    passwordConfirmValidity
  );

  const securityQuestionInput = new SecurityQuestionInput(
    $('#security_question_container'),
    'Select a security question...',
    securityQuestionValidity
  );

  const securityQuestionAnswerInput = new SecurityQuestionAnswerInput(
    $('#security_question_answer_container'),
    securityQuestionAnswerRegex,
    securityQuestionAnswerValidity
  );

  showById('home-link', 'login-link');

  // redirect the user if the user becomes logged in while viewing the page
  forceNotLoggedIn();

  // get security questions and add them to the form
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onload = () => {
    if (xmlHttp.status === 200) {
      xmlHttp.response.forEach(({ id, question, }) => {
        $('select').append($('<option>').attr('value', id).html(question));
      });
      return;
    }
    window.location.replace('/500');
  };
  xmlHttp.open('GET', '/api/user/security_questions', true);
  xmlHttp.responseType = 'json';
  xmlHttp.send(null);

  $('form').on('submit', (event) => {
    event.preventDefault();

    // validate inputs
    const allValid = checkValidities(
      usernameInput, passwordInput, passwordConfirmInput,
      securityQuestionInput, securityQuestionAnswerInput
    );

    if (!allValid) {
      return;
    }

    $.post('/api/user/signup', $('form').serialize(), () => {
      // on success response, redirect to login page
      window.location.replace('/login');

    }).fail((res) => {
      // handle non-success response codes
      if (res.status === 400) {
        const handledResponse = handleServerResponseMany(
          res.responseJSON,
          usernameInput, passwordInput, passwordConfirmInput,
          securityQuestionInput, securityQuestionAnswerInput
        );

        if (handledResponse) {
          return;
        }
      }
      window.location.replace('/500');
    });
  });
});
