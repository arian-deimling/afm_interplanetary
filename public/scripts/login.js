import {
  PasswordInput,
  UsernameInput,
  checkValidities,
  forceNotLoggedIn,
  handleServerResponseMany,
  passwordExistsValidity,
  showById,
  usernameExistsValidity
} from './util.js';

import { existsRegex } from './config/validation.config.js';

$(() => {

  const usernameInput = new UsernameInput(
    $('#username_field_container'),
    existsRegex,
    usernameExistsValidity
  );

  const passwordInput = new PasswordInput(
    $('#password_field_container'),
    existsRegex,
    passwordExistsValidity
  );

  showById('home-link', 'signup-link');

  // redirect the user if the user becomes logged in while viewing the page
  forceNotLoggedIn();

  $('form').on('submit', (event) => {
    event.preventDefault();

    // validate inputs
    const allValid = checkValidities(usernameInput, passwordInput);
    if (!allValid) {
      return;
    }

    $.post('/api/user/login', $('form').serialize(), () => {
      // on success response, redirect to login page
      window.location.replace('/');

    }).fail((res) => {
      // handle non-success response codes
      if (res.status === 400) {
        const handled = handleServerResponseMany(
          res.responseJSON,
          usernameInput, passwordInput
        );
        if (handled) {
          return;
        }
      }
      window.location.replace('/500');
    });
  });
});
