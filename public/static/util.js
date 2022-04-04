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

function checkSecurityQuestion() {
  const securityQuestionInput = $('#security_question_id');
  if (securityQuestionInput.val() === '0') {
      securityQuestionInput[0].setCustomValidity(
          'You must select a security question.'
      );
      securityQuestionInput[0].reportValidity();
      return false;
  } else {
      securityQuestionInput[0].setCustomValidity('');
      securityQuestionInput[0].reportValidity();
      return true;
  }
}

function checkSecurityQuestionAnswer() {
  const securityQuestionAnswerInput = $('#security_question_answer');
  if (!securityQuestionAnswerRegex.test(securityQuestionAnswerInput.val())) {
      securityQuestionAnswerInput[0].setCustomValidity(
          'Security question answer must be between 1 and 99 characters.'
      );
      securityQuestionAnswerInput[0].reportValidity();
      return false;
  } else {
      securityQuestionAnswerInput[0].setCustomValidity('');
      securityQuestionAnswerInput[0].reportValidity();
      return true;
  }
}
