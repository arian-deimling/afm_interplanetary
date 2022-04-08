'use strict';

// TODO(AD) - fix indentation
let passwordFields;
$(() => {
  $('#logout-link').on('click', (e) => {
    e.preventDefault();

    // end all intervals
    const maxIntervalId = window.setInterval(() => {}, Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < maxIntervalId; i++) {
      window.clearInterval(i);
    }
    window.location.replace('/api/logout');
  });
  passwordFields;
  $('#show-pass').on('change', () => {
    if (passwordFields === undefined) {
      passwordFields = $('input[type=password]');
    }
    console.log($(this).is(':checked'));
    if ($('#show-pass').is(':checked')) {
      passwordFields.attr('type', 'text');
    } else {
      passwordFields.attr('type', 'password');
    }
  });
})

const locale = window.navigator.userLanguage || window.navigator.language;
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function parseDateLocalTimezone(date) {
  date = new Date(date);
  let utcDate = new Date(date.toLocaleString(locale, { timeZone: 'UTC' }));
  let tzDate = new Date(date.toLocaleString(locale, { timeZone: timezone }));
  let offset = utcDate.getTime() - tzDate.getTime();

  date.setTime(date.getTime() + offset);
  return date;
}

function loginCheck() {
  window.setInterval(async () => {
    let loggedIn;
    try {
      loggedIn = await checkUserLoggedIn();
    } catch (err) {
      // TODO(AD) - need to do something better here
      console.log(err);
      return;
    }
    // if user becomes logged out, redirect to login page
    if (!loggedIn) {
      clearInterval(loginCheck);
      alert('Your session has expired. Please log in again to continue!');
      window.location.replace('/login');
    }
  }, 2500);
}

function hideById() {
  for (let i = 0; i < arguments.length; i++) {
    $(`#${arguments[i]}`).attr('hidden', 'true');
  }
}

function showById() {
  for (let i = 0; i < arguments.length; i++) {
    $(`#${arguments[i]}`).removeAttr('hidden');
  }
}

function checkUsername() {
  const usernameInput = $('#username');
  if (!usernameRegex.test(usernameInput.val())) {
    usernameInput[0].setCustomValidity(
      'Username must be between 8 and 20 characters long and contain only numbers and/or letters.'
    );
    usernameInput[0].reportValidity();
    return false;
  } else {
    usernameInput[0].setCustomValidity('');
    usernameInput[0].reportValidity();
    return true;
  }
}

function checkPassword() {
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

function checkPassVerify() {
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

function checkSelection(selector, message) {
  const selectionInput = $(`${selector}`);
  if (selectionInput.val() === '0') {
    selectionInput[0].setCustomValidity(message);
    selectionInput[0].reportValidity();
    return false;
  }
  selectionInput[0].setCustomValidity('');
  selectionInput[0].reportValidity();
  return true;
}

function checkSecurityQuestion() {
  return checkSelection(
    '#security_question_id', 
    'You must select a security question.',
  );
}

function checkNumPassengers() {
  return checkSelection(
    '#num_passengers',
    'You must select the number of passengers in your reservation.',
  );
}

function checkSecurityQuestionAnswer() {
  const securityQuestionAnswerInput = $('#security_question_answer');
  if (!securityQuestionAnswerRegex.test(securityQuestionAnswerInput.val())) {
    securityQuestionAnswerInput[0].setCustomValidity(
      'Security question answer must be between 1 and 99 characters.'
    );
    securityQuestionAnswerInput[0].reportValidity();
    return false;
  }
  securityQuestionAnswerInput[0].setCustomValidity('');
  securityQuestionAnswerInput[0].reportValidity();
  return true;
}

function checkTripDate() {
  if ($('#trip_date').val() === '') {
    $('#trip_date')[0].setCustomValidity('You must select a trip date.');
    $('#trip_date')[0].reportValidity();
    return false;
  }
  $('#trip_date')[0].setCustomValidity('');
  $('#trip_date')[0].reportValidity();
  return true;
}

function checkUserLoggedIn() {
  return new Promise((resolve, reject) => {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', '/api/login');
    xmlHttp.onload = () => {
      if (xmlHttp.status == 200) {
        resolve(true);
      } else if (xmlHttp.status == 400) {
        resolve(false);
      } else {
        reject({
          message: 'Unknown response status code.',
          code: xmlHttp.status,
        });
      }
    };
    xmlHttp.onerror = () => {
      reject({
        message: 'Unexpected response from the server.',
        response: xmlHttp.responseText,
      });
    };
    xmlHttp.send();
  });
}

// redirect the user to the home page if they are logged in
async function redirectOnLogin() {
  // check login every 5 sec and redirect to home
	// page is user becomes logged in
	window.setInterval(async () => {
		let loggedIn;
		try {
			loggedIn = await checkUserLoggedIn();
		} catch (err) {
			// TODO(AD) - need to do something better here
			console.log(err);
			return;
		}
		// if user becomes logged out, redirect to login page
		if (loggedIn) {
			window.location.replace('/');
		}
	}, 2500);
}

function checkUsernameExists() {
  const usernameInput = $('#username');
  if (usernameInput.val().length === 0) {
    usernameInput[0].setCustomValidity(
      'Username is required.'
    );
    usernameInput[0].reportValidity();
    return false;
  } else {
    usernameInput[0].setCustomValidity('');
    usernameInput[0].reportValidity();
    return true;
  }
}

function checkPasswordExists() {
  const passwordInput = $('#password');
  if (passwordInput.val().length === 0) {
      passwordInput[0].setCustomValidity(
          'Password is required.'
      );
      passwordInput[0].reportValidity();
      return false;
  } else {
      passwordInput[0].setCustomValidity('');
      passwordInput[0].reportValidity();
      return true;
  }
}

function checkSecurityQuestionAnswerExists() {
  const answerInput = $('#security_question_answer');
  if (answerInput.val().length === 0) {
      answerInput[0].setCustomValidity(
          'Security question answer is required.'
      );
      answerInput[0].reportValidity();
      return false;
  } else {
      answerInput[0].setCustomValidity('');
      answerInput[0].reportValidity();
      return true;
  }
}
