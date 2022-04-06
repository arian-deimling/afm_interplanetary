'use strict';

$(() => {

  showById('home-link', 'about-link', 'login-link');

  // redirect the user if the user becomes logged in while viewing the page
  redirectOnLogin();

  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      console.log(JSON.parse(xmlHttp.responseText));
      for (let {id, question} of JSON.parse(xmlHttp.responseText)) {
        $('#security_question_id').append(
          `<option value=${id}>${question}</option>`
        );
      }
    }
  }
  xmlHttp.open('GET', '/api/security_questions', true);
  xmlHttp.send(null);

  // validate username input
  $('#username').on('keyup', () => {
    checkUsername();
  });

  // validate password input
  $('#password').on('keyup', () => {
    checkPassword();
  });

  // validate confirm password input
  $('#pass_verify').on('keyup', () => {
    checkPassVerify();
  });

  // validate security question input
  $('#security_question_id').on('change', () => {
    checkSecurityQuestion();
  });

  // validate security question answer
  $('#security_question_answer').on('keyup', () => {
    checkSecurityQuestionAnswer();
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
      console.log(res.responseText);
      if (res.status === 400) {
        $(`#${res.responseJSON.what}`)[0].setCustomValidity(res.responseJSON.message);
        $(`#${res.responseJSON.what}`)[0].reportValidity();
      } else {
        // TODO(AD) - redirect to error page
        alert('Invalid response from the server.');
      }
    });
  });
});
