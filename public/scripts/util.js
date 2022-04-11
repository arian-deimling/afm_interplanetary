'use strict';

const usernameFieldName = 'username';
const passwordFieldName = 'password';
const passwordConfirmFieldName = 'pass_verify';
const securityQuestionFieldName = 'security_question_id';
const securityQuestionAnswerFieldName = 'security_question_answer';

class Input {
	constructor(parent, type, name, placeholder, validationRegex, validationMessage) {
    this.name = name;
		this.field = $('<input>').attr('type', type).attr('name', name)
      .attr('placeholder', placeholder);
		this.validationRegex = validationRegex;
		this.validationMessage = validationMessage;
		
		// after each keyup, check validity
		this.field.on('keyup', e => {
			if (e.key !== 'Enter' && e.key !== 'Tab') {
				this.checkValidity();
				this.reportValidity();
			}
		});
		this.field.on('focus', e => {
			this.reportValidity();
		});
		this.field.on('blur', e => {
			this.checkValidity();
		});
		parent.append(this.field);
	}

	// check validity against regex and set validity message
	checkValidity() {
		if (!this.validationRegex.test(this.field.val())) {
			this.field[0].setCustomValidity(this.validationMessage);
			return false;
		}
		this.field[0].setCustomValidity('');
		return true;
	}

	// display validity message
	reportValidity() {
		if (arguments.length > 0) {
			this.field[0].setCustomValidity(arguments[0]);
		}
		this.field[0].reportValidity();
	}
  
  show() {
    this.field.removeAttr('hidden');
  }

  hide() {
    this.field.attr('hidden', '');
  }

  handleServerResponse(responseJson) {
    if (responseJson.what === this.name) {
      this.reportValidity(responseJson.message);
    }
    return responseJson.what === this.name;
  } 

  get val() {
    return this.field.val();
  }
}

class UsernameInput extends Input {
	constructor(parent, validationRegex, validationMessage) {
		super(parent, 'text', usernameFieldName, 'Username', validationRegex,
      validationMessage);
	}
}

class SecurityQuestionInput {
	constructor(parent, placeholder, validationMessage) {
		this.field = $('<select>').attr('name', securityQuestionFieldName)
      .attr('placeholder', placeholder);
    this.field.append($('<option>').attr('value', 0).html(placeholder));
		this.validationMessage = validationMessage;
		
		// after each keyup, check validity
		this.field.on('change', e => {
      this.checkValidity();
      this.reportValidity();
		});
		this.field.on('focus', e => {
			this.reportValidity();
		});
		this.field.on('blur', e => {
			this.checkValidity();
		});
		parent.append(this.field);
	}

	// check validity against regex and set validity message
	checkValidity() {
    if (this.val == 0) {
			this.field[0].setCustomValidity(this.validationMessage);
			return false;
    }
		this.field[0].setCustomValidity('');
		return true;
	}

	// display validity message
	reportValidity() {
		if (arguments.length > 0) {
			this.field[0].setCustomValidity(arguments[0]);
		}
		this.field[0].reportValidity();
	}

  show() {
    this.field.removeAttr('hidden');
  }

  hide() {
    this.field.attr('hidden', '');
  }

  handleServerResponse(responseJson) {
    if (responseJson.what === this.name) {
      this.reportValidity(responseJson.message);
    }
    return responseJson.what === this.name;
  } 

  get val() {
    return this.field.val();
  }
}

class PasswordInput extends Input {
	constructor(parent, validationRegex, validationMessage) {
		super(parent, 'password', passwordFieldName, 'Password', validationRegex,
      validationMessage);
	}
}

class SecurityQuestionAnswerInput extends Input {
  constructor(parent, validationRegex, validationMessage) {
    super(parent, 'text', securityQuestionAnswerFieldName,
      'Security Question Answer', validationRegex, validationMessage);
  }
}

class PasswordConfirmInput extends Input {
	constructor(parent, passwordInput, validationMessage) {
		super(parent, 'password', passwordConfirmFieldName, 'Confirm Password',
      /^.*$/, validationMessage);
    this.passwordInput = passwordInput;
	}

	// check validity against regex and set validity message
	checkValidity() {
		if (this.val != this.passwordInput.val) {
			this.field[0].setCustomValidity(this.validationMessage);
			return false;
		}
		this.field[0].setCustomValidity('');
		return true;
	}
}

// TODO(AD) - fix indentation
$(() => {
  $('#logout-link').on('click', (e) => {
    e.preventDefault();

    // end all intervals
    const maxIntervalId = window.setInterval(() => {}, Number.MAX_SAFE_INTEGER);
    for (let i = 1; i <= maxIntervalId; i++) {
      window.clearInterval(i);
    }
    window.location.replace('/api/logout');
  });
  let passwordFields;
  $('#show-pass').on('change', () => {
    if (passwordFields === undefined) {
      passwordFields = $('input[type=password]');
    }
    if ($('#show-pass').is(':checked')) {
      passwordFields.attr('type', 'text');
    } else {
      passwordFields.attr('type', 'password');
    }
  });
  $('#show-pass-label').on('click', () => {
    if (passwordFields === undefined) {
      passwordFields = $('input[type=password]');
    }
    if ($('#show-pass').is(':checked')) {
      passwordFields.attr('type', 'text');
    } else {
      passwordFields.attr('type', 'password');
    }
    $('#show-pass').attr('checked', !($('#show-pass').attr('checked')));
  })
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
    xmlHttp.send();
  });
}

function forceLoggedIn() {
  window.setInterval(async () => {
    let loggedIn;
    try {
      loggedIn = await checkUserLoggedIn();
    } catch (err) {
      // do nothing on error response from server
      return;
    }
    // if user becomes logged out, redirect to login page
    if (!loggedIn) {
      clearInterval(forceLoggedIn);
      alert('Your session has expired. Please log in again to continue!');
      window.location.replace('/login');
    }
  }, 2500);
}

// redirect the user to the home page if they are logged in
function forceNotLoggedIn() {
  // check login every 5 sec and redirect to home
	// page is user becomes logged in
	window.setInterval(async () => {
		let loggedIn;
		try {
			loggedIn = await checkUserLoggedIn();
		} catch (err) {
      // do nothing on error checking login status
			return;
		}
		// if user becomes logged out, redirect to login page
		if (loggedIn) {
			window.location.replace('/');
		}
	}, 2500);
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

function checkNumPassengers() {
  return checkSelection(
    '#num_passengers',
    'You must select the number of passengers in your reservation.',
  );
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
