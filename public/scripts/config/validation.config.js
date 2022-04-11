// alphanumeric only; 8 - 20 characters
const usernameRegex = /^[A-Za-z0-9]{8,20}$/u;

// alphanumeric only; 8 - 20 characters; require one uppercase, one lowercase,
// one digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/u;

// at least one character
const securityQuestionAnswerRegex = /^.{1,99}$/u;

const existsRegex = /^.+$/u;

// use specific date format
const dateRegex = /^\d\d?\/\d\d?\/\d\d\d\d$/u;

export {
  usernameRegex,
  passwordRegex,
  securityQuestionAnswerRegex,
  existsRegex,
  dateRegex
};
