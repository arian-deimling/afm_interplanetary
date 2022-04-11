# AFM Interplanetary Website

## Setup

### npm

1. Download Node.js from [`https://nodejs.org/en/download/`](https://nodejs.org/en/download/).
2. Make sure Node.js is added to your PATH environment variable.
   * The command `npm --version` should print out the verison of Node.js that you just installed. 

### mysql

1. Download mysql from [`https://dev.mysql.com/downloads/mysql/`](https://dev.mysql.com/downloads/mysql/).
2. Make sure mysql is added to your PATH environment variable.
   * The command `mysql --version` should print out the verison of mysql that you just installed. 

### Demo

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
