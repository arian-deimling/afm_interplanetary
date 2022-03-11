"use strict";

$(() => {
    $('form').on('submit', (event) => {
        event.preventDefault();
        $.post('/adduser', $('form').serialize(), (res) => {
            // on success response, redirect to login page
            window.location.replace('/login');
        })
        // handle non-success response codes
        .fail((res) => {
            if (res.status == 400) {
                // console.log(res.responseText);
                const errors = JSON.parse(res.responseText);
                if (errors.length === 0) {
                    console.log(`WARNING: res.status is 400 but there is no errors array`);
                }
                // TODO - clear error messages when resolved
                errors.forEach((element) => {
                    $(`#${element.param}`).css('margin-bottom', '0.1rem');
                    $(`#${element.param}`).css('border-bottom-color', 'red');
                    $(`#${element.param}-error`).html(element.msg);
                });
            } else if (res.status == 409) {
                $(`#username`).css('margin-bottom', '0.1rem');
                $(`#username`).css('border-bottom-color', 'red');
                $(`#username-error`).html('Username already exists. Please try a different username.');
            } else {
                console.log(`WARNING: unknown error code ${res.status}`);
                alert(`invalid response from server: ${res.status}`);
            }
        });
    });
});
