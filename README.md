# AFM Interplanetary Website

## Setup

### Node.js

1. Download Node.js from [`https://nodejs.org/en/download/`](https://nodejs.org/en/download/); by default the installer will add Node.js to your PATH environment variable.
2. If successful, the command `npm --version` should output the version of Node.js that you installed.

### MySQL Community Server

1. Download and install MySql Community Server and add it to PATH environment variable.
   * [Here is a guide](https://overiq.com/installing-mysql-windows-linux-and-mac/) for Windows, macOS, and some Linux distributions.
2. If successful, the command `mysql --version` should output the version of mysql that you installed.

## Demo

### macOS / Linux

1. Make the demo setup script executable with the following command in the main project directory:
```sh
chmod 744 demo.sh
```
2. Run the demo setup script with the command:
   * Enter your mysql root user's password when prompted.
```sh
./demo.sh
```
3. Navigate to [`http://localhost:8080/`](http://localhost:8080/) in your browser.

### Windows

1. Create a file called `.env` and fill it with the following text:
```
DB_USER="afm_interplanetary_server"
DB_PASS="$uperStringP@ssw0rd"
SESSION_SECRET="mY$ecre7"
```

2. Using the command-line interface, execute the SQL commands from the `demo.sql` file.

3. Run the command `npm i` to install the required dependencies.

4. Run the command `npm start` to start the server.

5. Navigate to [`http://localhost:8080/`](http://localhost:8080/) in your browser.

## Usage

* The website is straight forward in terms of usage. It is highly recommended to use the navigation
  bar that is present at the top of each page to navigate the site. New users must sign up or use 
  one of the logins that are created for the demo. After logging in, users have the option of viewing
  existing reservations or creating new reservations. All demo users have existing reservations; however,
  if a new user account is created, it will have no reservations by default.

### Demo Users

* User 1:
  * username: arian123
  * password: Arian123

* User 2:
  * username: fehintola
  * password: Fehintola1

* User 3: 
  * username: mir12345
  * password: Mir12345

