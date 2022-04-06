// alphanumeric only; 8 - 20 characters
const usernameRegex = /^[A-Za-z0-9]{8,20}$/;

// alphanumeric only; 8 - 20 characters; require one uppercase, one lowercase, one digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/

// at least one character
const securityQuestionAnswerRegex = /^.{1,99}$/;

// use specific date format
// TODO(AD) - could generalize this and use Date() constructor to conver to this format
const dateRegex = /^\d\d?\/\d\d?\/\d\d\d\d$/;

if (typeof module === 'object' && module && typeof module.exports === 'object') {
  module.exports = { usernameRegex, passwordRegex, securityQuestionAnswerRegex };
}
