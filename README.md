# AFM Interplanetary Website

## Setup

### Node.js

1. Download Node.js from [`https://nodejs.org/en/download/`](https://nodejs.org/en/download/); by default the installer will add Node.js to your PATH environment variable.
2. If successful, the command `npm --version` should output the version of Node.js that you installed.

### MySQL Community Server

1. Download and install MySql Community Server and add it to PATH environment variable.
   * [Here is a guide](https://overiq.com/installing-mysql-windows-linux-and-mac/) for Windows, macOS, and some Linux distributions.
2. If successful, the command `mysql --version` should output the version of mysql that you installed.

### Demo

#### macOS / Linux

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
