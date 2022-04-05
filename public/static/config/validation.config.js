// alphanumeric only; 8 - 20 characters
const usernameRegex = /^[A-Za-z0-9]{8,20}$/;

// alphanumeric only; 8 - 20 characters; require one uppercase, one lowercase, one digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/

// at least one character
const securityQuestionAnswerRegex = /^.{1,99}$/;

if (typeof module === 'object' && module && typeof module.exports === 'object') {
  module.exports = { usernameRegex, passwordRegex, securityQuestionAnswerRegex };
}
