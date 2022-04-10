'use strict';

$(() => {

  showById('home-link', 'login-link');

  // redirect the user if the user becomes logged in while viewing the page
  forceNotLoggedIn();

  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onload = () => {
    if (xmlHttp.status === 200) {
      for (let {id, question} of JSON.parse(xmlHttp.responseText)) {
        $('#security_question_id').append(
          `<option value=${id}>${question}</option>`
        );
      }
      return;
    }
    window.location.replace('/500');
  }
  xmlHttp.open('GET', '/api/security_questions', true);
  xmlHttp.send(null);

  // validate username input
  $('#username').on('keypress', (e) => {
    if (e.key !== 'Enter') {
      checkUsername();
    }
  });

  // validate password input
  $('#password').on('keyup', () => {
    if (e.key !== 'Enter') {
      checkPassword();
    }
  });

  // validate confirm password input
  $('#pass_verify').on('keyup', () => {
    if (e.key !== 'Enter') {
      checkPassVerify();
    }
  });

  // validate security question input
  $('#security_question_id').on('change', () => {
    checkSecurityQuestion();
  });

  // validate security question answer
  $('#security_question_answer').on('keyup', () => {
    if (e.key !== 'Enter') {
      checkSecurityQuestionAnswer();
    }
  });

  $('form').on('submit', (event) => {
    event.preventDefault();

    // validate input before submitting form
    if (!(checkUsername() && checkPassword() && checkPassVerify() && checkSecurityQuestion() && checkSecurityQuestionAnswer())) {
      return;
    }

    $.post('/api/signup', $('form').serialize(), (res) => {
      // on success response, redirect to login page
      window.location.replace('/login');
    })
    // handle non-success response codes
    .fail((res) => {
      if (res.status === 400) {
        $(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
        $(`#${res.responseJSON.what}`)[0].reportValidity();
      } else {
        window.location.replace('/500');
      }
    });
  });
});
