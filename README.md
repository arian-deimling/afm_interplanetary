# Assignment 4

## Setup

### mysql

Open the mysql command-line interface and enter the following commands:
1. `CREATE USER 'assignment4'@'localhost' IDENTIFIED BY '1234567890';`
2. `CREATE DATABASE afm_interplanetary;`
3. `USE afm_interplanetary;`
4. `GRANT ALL PRIVILEGES ON afm_interplanetary.* TO 'assignment4'@'localhost';`

### npm

Navigate to the root project directory (the directory that this file is in) in a shell and enter the following commands:
1. `npm install`
2. `npm start`

## Usage

### Home Page

1. Navigate to [`http://localhost:8080/`](http://localhost:8080/) in your browser.

### Sign Up Page

1. From the `Home` page, click the `Sign Up` link in the upper-right corner of the page.
   * Alternatively, navigate to [`http://localhost:8080/signup`](http://localhost:8080/signup) in your browser.
2. Create a new accout following the message in the form.
3. Click the `Create Account` button.
   * If any error messages appear, correct them and click the `Create Account` button again.

### Login Page

1. Once you have successfully created a new account, you will be automatically redirected to the `Login` page.
   * Alternatively, navigate to [`http://localhost:8080/login`](http://localhost:8080/login) in your browser.
   * Or, click the `Login` link in the upper-right corner of any other page.
2. Enter the username and password that you just created.
3. Click the `Login` button.
   * If any error messages appear, correct them and click the `Login` button again.

### Home Page (Logged In)

1. Once you have successfully logged in to your account, you will be automatically redirected back to the `Home` page.
2. If you attempt to navigate to the `Sign Up` or `Login` page you will be immediately redirected back to the `Home` page.
3. Click the `Logout` link in the upper-right corner of the page to log out.

### Reset Password Page

1. Navigate to the `Login` page.
   * Alternatively, navigate to [`http://localhost:8080/reset`](http://localhost:8080/reset) in your browser.
2. Enter your username and click the `Submit` button.
   * If any error messages appear, correct them and click the `Submit` button again.
3. Answer your security question and enter a new password.
4. Click the `Reset Password` button.
   * If any error messages appear, correct them and click the `Reset Password` button again.
5. You will automatically be redirected to the `Login` page where you can log in with your new credentials.
