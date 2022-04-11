const usernameFieldName = 'username';
const passwordFieldName = 'password';
const passwordConfirmFieldName = 'pass_verify';
const securityQuestionFieldName = 'security_question_id';
const securityQuestionAnswerFieldName = 'security_question_answer';

const usernameValidity = 'Username must be between 8 and 20 characters long ' +
                         'and contain only numbers and/or letters.';
const passwordValidity = 'Password must be between 8 and 20 characters and ' +
                         'contain one uppercase letter, one lowercase ' +
                         'letter, one numner, and no special characters.';
const passwordConfirmValidity = 'Password confirmation must match passsword.';
const securityQuestionValidity = 'You must select a security question.';
const securityQuestionAnswerValidity = 'Security Question Answer must be ' +
                                       'between 1 and 99 characters.';
const usernameExistsValidity = 'Username is required.';
const passwordExistsValidity = 'Password is required.';
const securityQuestionAnswerExistsValidity = 'Security Question Answer is ' +
                                             'required.';

class Input {
  // unhide this input field
  show() {
    this.field.removeAttr('hidden');
  }

  // hide this input field
  hide() {
    this.field.attr('hidden', '');
  }

  // display validity message
  reportValidity(...args) {
    if (args.length > 0) {
      this.field[0].setCustomValidity(args[0]);
    }
    this.field[0].reportValidity();
  }

  // display validation message and return true if the server response indicates
  // this input field is invalid; otherwise, return false
  handleServerResponse(responseJson) {
    if (responseJson.what === this.name) {
      this.reportValidity(responseJson.message);
    }
    return responseJson.what === this.name;
  }

  // return the value of this field
  get val() {
    return this.field.val();
  }
}

class TextBasedInput extends Input {
  constructor(
    parent, type, name, placeholder, validationRegex,
    validationMessage
  ) {
    super();
    this.name = name;
    this.field = $('<input>').attr('type', type).attr('name', name).
      attr('placeholder', placeholder);
    this.validationRegex = validationRegex;
    this.validationMessage = validationMessage;

    // after each keyup, check validity
    this.field.on('keyup', (e) => {
      if (e.key !== 'Enter' && e.key !== 'Tab') {
        this.checkValidity();
        this.reportValidity();
      }
    });
    this.field.on('focus', () => {
      this.reportValidity();
    });
    this.field.on('blur', () => {
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
}

class UsernameInput extends TextBasedInput {
  constructor(parent, validationRegex, validationMessage) {
    super(
      parent, 'text', usernameFieldName, 'Username', validationRegex,
      validationMessage
    );
  }
}

class SecurityQuestionInput extends Input {
  constructor(parent, placeholder, validationMessage) {
    super();
    this.field = $('<select>').attr('name', securityQuestionFieldName).
      attr('placeholder', placeholder);
    this.field.append($('<option>').attr('value', 0).html(placeholder));
    this.validationMessage = validationMessage;

    // after each keyup, check validity
    this.field.on('change', () => {
      this.checkValidity();
      this.reportValidity();
    });
    this.field.on('focus', () => {
      this.reportValidity();
    });
    this.field.on('blur', () => {
      this.checkValidity();
    });
    parent.append(this.field);
  }

  // check validity against regex and set validity message
  checkValidity() {
    if (this.val === '0') {
      this.field[0].setCustomValidity(this.validationMessage);
      return false;
    }
    this.field[0].setCustomValidity('');
    return true;
  }
}

class PasswordInput extends TextBasedInput {
  constructor(parent, validationRegex, validationMessage) {
    super(
      parent, 'password', passwordFieldName, 'Password', validationRegex,
      validationMessage
    );
  }
}

class SecurityQuestionAnswerInput extends TextBasedInput {
  constructor(parent, validationRegex, validationMessage) {
    super(
      parent, 'text', securityQuestionAnswerFieldName,
      'Security Question Answer', validationRegex, validationMessage
    );
  }
}

class PasswordConfirmInput extends TextBasedInput {
  constructor(parent, passwordInput, validationMessage) {
    super(
      parent, 'password', passwordConfirmFieldName, 'Confirm Password',
      /^.*$/u, validationMessage
    );
    this.passwordInput = passwordInput;
  }

  // check validity against regex and set validity message
  checkValidity() {
    if (this.val !== this.passwordInput.val) {
      this.field[0].setCustomValidity(this.validationMessage);
      return false;
    }
    this.field[0].setCustomValidity('');
    return true;
  }
}

class SeatSelection {
  constructor(container) {
    this.seatIds = [
      'A1', 'A2', 'A3', 'A4',
      'B1', 'B2', 'B3', 'B4',
      'C1', 'C2', 'C3', 'C4',
    ];
    this.container = container;
    this.container.addClass('flex-rows').css('margin-bottom', '2rem');
    this.subContainer = $('<div>').css('width', 'fit-content');
    this.front = $('<div>').attr('id', 'front').attr('class', 'flex-cols');
    this.back = $('<div>').attr('id', 'back').attr('class', 'flex-cols');
    this.table = $('<table>');
    this.tbody = $('<tbody>');
    const cockpitLabel = $('<h3>').css('padding', '5rem 2rem').html('Cockpit').
      addClass('black-text');

    this.container.append($('<div>').css('width', '100%'));
    this.container.append(this.subContainer);
    this.container.append($('<div>').css('width', '100%'));
    this.subContainer.append(this.front).append(this.back);
    this.front.append(cockpitLabel);
    this.back.append(this.table);
    this.table.append(this.tbody);

    this.front.css('border', '3px solid gray').
      css('border-top-right-radius', '50% 90%').
      css('border-top-left-radius', '50% 90%');
    this.back.css('border', '3px solid gray').css('border-top', '0');

    // create 3 x 4 table (seat chart)
    for (let r = 0; r < 3; r++) {
      const row = $('<tr>');

      for (let c = 0; c < 4; c++) {
        const data = $('<td>');
        const rowLetter = String.fromCharCode(65 + r);

        // create seat id, then label and checkbox input with that id
        const id = `${rowLetter}${c + 1}`;
        const input = $('<input>').attr('type', 'checkbox').
          attr('id', id).attr('name', id);
        const label = $('<label>').attr('for', id).html(id);

        data.append(input).append(label);
        row.append(data);

        // create spacing in the middle of the row
        if (c === 1) {
          const spacing = $('<td>').
            html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
          row.append(spacing);
        }
      }
      this.tbody.append(row);
    }
  }

  show() {
    this.container.css('display', 'flex');
  }

  hide() {
    this.container.css('display', 'none');
  }

  update() {
    // validate trip date input
    if (!checkTripDate()) {
      return;
    }
    // reset all seats to default unchecked and enabled
    for (const seatId of this.seatIds) {
      $(`#${seatId}`).removeAttr('checked');
      $(`#${seatId}`).removeAttr('disabled');
    }
    // request seating information for this trip from the server
    $.post('/api/reservation/seats', $('form').serialize(), (res) => {
      console.log(res);
      for (const userSeatId of res.userSeats) {
        $(`#${userSeatId}`).attr('checked', 'true');
      }
      for (const unavailableSeatId of res.otherSeats) {
        $(`#${unavailableSeatId}`).attr('disabled', 'true');
      }
    }).
      fail((res) => {
        // if login status error occurs, notify user and redirect to login page
        if (res.status === 400 && res.responseJSON.what === 'trip_date') {
          getAndShowCapacity();
          return;
        }
        if (res.status === 400) {
          $(`#${res.responseJSON.what}`)[0].
            setCustomValidity(res.responseJSON.message);
          $(`#${res.responseJSON.what}`)[0].reportValidity();
          return;
        }
        window.location.replace('/500');
      });
  }
}

$(() => {
  $('#logout-link').on('click', (e) => {
    e.preventDefault();

    // end all intervals
    const maxIntervalId = window.setInterval(() => {
      /* interval does nothing */
    }, Number.MAX_SAFE_INTEGER);
    for (let i = 1; i <= maxIntervalId; i++) {
      window.clearInterval(i);
    }
    window.location.replace('/api/logout');
  });
  let passwordFields = null;
  $('#show-pass').on('change', () => {
    if (passwordFields === null) {
      passwordFields = $('input[type=password]');
    }
    if ($('#show-pass').is(':checked')) {
      passwordFields.attr('type', 'text');
    } else {
      passwordFields.attr('type', 'password');
    }
  });
  $('#show-pass-label').on('click', () => {
    if (passwordFields === null) {
      passwordFields = $('input[type=password]');
    }
    if ($('#show-pass').is(':checked')) {
      passwordFields.attr('type', 'text');
    } else {
      passwordFields.attr('type', 'password');
    }
    $('#show-pass').attr('checked', !$('#show-pass').attr('checked'));
  });
});

const locale = window.navigator.userLanguage || window.navigator.language;
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function parseDateLocalTimezone(date) {
  date = new Date(date);
  const utcDate = new Date(date.toLocaleString(locale, { timeZone: 'UTC', }));
  const tzDate = new Date(date.toLocaleString(locale, { timeZone: timezone, }));
  const offset = utcDate.getTime() - tzDate.getTime();

  date.setTime(date.getTime() + offset);
  return date;
}

function hideById(...args) {
  for (let i = 0; i < args.length; i++) {
    $(`#${args[i]}`).attr('hidden', 'true');
  }
}

function showById(...args) {
  for (let i = 0; i < args.length; i++) {
    $(`#${args[i]}`).removeAttr('hidden');
  }
}

function checkUserLoggedIn() {
  return new Promise((resolve, reject) => {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', '/api/login');
    xmlHttp.onload = () => {
      if (xmlHttp.status === 200) {
        resolve(true);
      } else if (xmlHttp.status === 400) {
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
  window.setInterval(async() => {
    let loggedIn = false;
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
  window.setInterval(async() => {
    let loggedIn = true;
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

function reloadOnLoginChange(userLoggedIn) {
  // start checking login status periodically for changes
  window.setInterval(async() => {
    // check whether the user is currently logged in
    let loggedIn = false;
    try {
      loggedIn = await checkUserLoggedIn();
    } catch (err) {
      // nothing to do on unusual response from server
      return;
    }
    // if user login state changed
    if (userLoggedIn !== loggedIn) {
      location.reload();
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
    'You must select the number of passengers in your reservation.'
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

function checkValidities(...args) {
  for (let i = 0; i < arguments.length; i++) {
    if (!args[i].checkValidity()) {
      args[i].reportValidity();
      return false;
    }
  }
  return true;
}

function handleServerResponseMany(responseJson, ...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i].handleServerResponse(responseJson)) {
      return true;
    }
  }
  return false;
}

export {
  usernameValidity,
  passwordValidity,
  passwordConfirmValidity,
  securityQuestionValidity,
  securityQuestionAnswerValidity,
  usernameExistsValidity,
  passwordExistsValidity,
  securityQuestionAnswerExistsValidity,
  usernameFieldName,
  passwordFieldName,
  passwordConfirmFieldName,
  securityQuestionFieldName,
  securityQuestionAnswerFieldName,
  UsernameInput,
  SecurityQuestionInput,
  PasswordInput,
  SecurityQuestionAnswerInput,
  PasswordConfirmInput,
  SeatSelection,
  parseDateLocalTimezone,
  hideById,
  showById,
  checkUserLoggedIn,
  forceLoggedIn,
  forceNotLoggedIn,
  reloadOnLoginChange,
  checkSelection,
  checkNumPassengers,
  checkTripDate,
  checkValidities,
  handleServerResponseMany
};
