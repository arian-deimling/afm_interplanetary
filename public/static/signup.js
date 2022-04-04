"use strict";

const checkUsername = () => {
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

const checkPassword = () => {
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

const checkPassVerify = () => {
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

const checkSecurityQuestion = () => {
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

const checkSecurityQuestionAnswer = () => {
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

$(() => {

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
