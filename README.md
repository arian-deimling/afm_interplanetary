# Assignment 4

## Setup

### mysql

1. Download mysql from [`https://dev.mysql.com/downloads/mysql/`](https://dev.mysql.com/downloads/mysql/).
2. Open the mysql command-line interface:
```
mysql -u root -p
```
3. Enter the root password when prompted.
4. Create a new user:
```sql
CREATE USER '<username>'@'localhost' IDENTIFIED BY '<password>';
```
5. Grant privileges to the new user:
```sql
GRANT ALL PRIVILEGES ON afm_interplanetary.* TO '<username>'@'localhost';
```
6. Exit the mysql command-line interface.
7. Run the setup SQL commands:
```
mysql -u <username> -p < setup.sql
```
8. Enter the password you just created when prompted. 

### .env file

1. Create a file named `.env` in the project directory (the directory that this README is in).
2. Add the following to the file:
```
DB_USER=<username>
DB_PASS=<password>
SESSION_SECRET=<some-secret>
```
3. Replace `<username>` and `<password>` with the credentials that you created in the mysql setup.
4. Replace `<some-secret>` with a password-like string (e.g. `mY$ecre7`).

### npm

1. Download Node.js from [`https://nodejs.org/en/download/`](https://nodejs.org/en/download/).
2. Open a terminal in the project directory (the directory this README is in).
3. Install the required packages:
```
npm install
```
4. Start the server:
```
npm start
```
