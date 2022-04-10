-- create the database
DROP DATABASE IF EXISTS afm_interplanetary;
CREATE DATABASE afm_interplanetary;
USE afm_interplanetary;

-- create a user for the server to access DB
DROP USER IF EXISTS 'afm_interplanetary_server'@'localhost';
CREATE USER 'afm_interplanetary_server'@'localhost' IDENTIFIED BY '$uperStrongP@ssw0rd';
GRANT ALL PRIVILEGES ON afm_interplanetary.* TO 'afm_interplanetary_server'@'localhost';

-- create the tables
CREATE TABLE `security_questions` (
    `id` INTEGER NOT NULL auto_increment ,
    `question` VARCHAR(255) NOT NULL UNIQUE, 
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `trips` (
    `id` INTEGER NOT NULL ,
    `date` DATE NOT NULL UNIQUE,
    `capacity` INTEGER NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `users` (
   `id` INTEGER NOT NULL auto_increment ,
   `security_question_id` INTEGER NOT NULL,
   `username` VARCHAR(255) NOT NULL UNIQUE,
   `password` VARCHAR(500) NOT NULL,
   `security_question_answer` VARCHAR(255) NOT NULL,
   `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL,
   PRIMARY KEY (`id`),
   FOREIGN KEY (`security_question_id`) REFERENCES `security_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `reservations` (
    `id` INTEGER NOT NULL auto_increment ,
    `num_passengers` INTEGER NOT NULL,
    `trip_id` INTEGER NOT NULL, `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL, 
    UNIQUE `reservations_trip_id_user_id_unique` (`trip_id`, `user_id`),
    PRIMARY KEY (`id`), 
    FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `seats` (
    `id` INTEGER NOT NULL auto_increment ,
    `seat` VARCHAR(2) NOT NULL,
    `reservation_id` INTEGER NOT NULL,
    UNIQUE `seat_reservation_id` (`seat`, `reservation_id`),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Sessions` (
    `session_id` VARCHAR(32) ,
    `expires` DATETIME, 
    `data` TEXT, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`session_id`)
) ENGINE=InnoDB;

-- seed tables with data
INSERT INTO `trips` VALUES
    (8162, DATE '2022-05-07', 12),
    (8176, DATE '2022-05-21', 12),
    (8190, DATE '2022-06-04', 12),
    (8204, DATE '2022-06-18', 12),
    (8218, DATE '2022-07-02', 12),
    (8232, DATE '2022-07-16', 12),
    (8253, DATE '2022-08-06', 12),
    (8267, DATE '2022-08-20', 12),
    (8281, DATE '2022-09-03', 12),
    (8295, DATE '2022-09-17', 12),
    (8309, DATE '2022-10-01', 12),
    (8323, DATE '2022-10-15', 12);

SELECT * FROM `trips` ORDER BY `id`; 
                                  /*
+------+------------+----------+
| id   | date       | capacity |
+------+------------+----------+
| 8141 | 2022-04-16 |       12 |
| 8162 | 2022-05-07 |       12 |
| 8176 | 2022-05-21 |       12 |
| 8190 | 2022-06-04 |       12 |
| 8204 | 2022-06-18 |       12 |
| 8218 | 2022-07-02 |       12 |
| 8232 | 2022-07-16 |       12 |
| 8253 | 2022-08-06 |       12 |
| 8267 | 2022-08-20 |       12 |
| 8281 | 2022-09-03 |       12 |
| 8295 | 2022-09-17 |       12 |
| 8309 | 2022-10-01 |       12 |
| 8323 | 2022-10-15 |       12 |
+------+------------+----------+
                                  */

INSERT INTO `security_questions` VALUES 
    (1, 'What was your childhood nickname?'),
    (2, 'In what city did you meet your spouse/significant other?'),
    (3, 'What is the name of your favorite childhood friend?'),
    (4, 'What street did you live on in third grade?'),
    (5, 'What is the middle name of your youngest child?'),
    (6, "What is your oldest sibling's middle name?"),
    (7, 'What school did you attend for sixth grade?'),
    (8, "What is your oldest cousin's first and last name?");

SELECT * FROM `security_questions` ORDER BY `id`;
                                                                  /*
+----+----------------------------------------------------------+
| id | question                                                 |
+----+----------------------------------------------------------+
|  1 | What was your childhood nickname?                        |
|  2 | In what city did you meet your spouse/significant other? |
|  3 | What is the name of your favorite childhood friend?      |
|  4 | What street did you live on in third grade?              |
|  5 | What is the middle name of your youngest child?          |
|  6 | What is your oldest sibling's middle name?               |
|  7 | What school did you attend for sixth grade?              |
|  8 | What is your oldest cousin's first and last name?        |
+----+----------------------------------------------------------+ */

INSERT INTO `users` VALUES
    (1, 1, 'arian123', 
        '$2b$10$IStNnwhi0Y.0wgCE7N65Cu3mKakPHm/vPAU2PYDf1cFxIeeSyhhyq', 
        '$2b$10$VRrlAArGxJbbSffzoKKIkuQpnWtlIrVrZ57b0n0uPNBN9h3DF40gq', 
        now(), now()),
    (2, 1, 'mir12345',
        '$2b$10$cc9UkAM9MJeS7NIwxQ6PHegRDX0IjKIVv5XLCH2afa.aii0TJLJQ.',
        '$2b$10$ToGIYGPJ2HgGZvWWgiQG7ODz2II2FMM7uBBHYyisJWuUxjdUF0ADG',
        now(), now()),
    (3, 1, 'fehintola',
        '$2b$10$tYzzW.KEbNWNJAaySFXdIep3IMkGYCAbUEWoukhv0sjoTJk/pbwYG',
        '$2b$10$St2Y8ImEDJtzxGThjebqa.aLzyh8XazAZFDbslGuqYOZoIaytS4Xi',
        now(), now());

INSERT INTO `reservations` VALUES
    (1, 6, 8162, 1, now(), now()),  -- arian123  | 05/07 | 6 passengers
    (2, 6, 8162, 2, now(), now()),  -- mir12345  | 05/07 | 6 passengers
    (3, 4, 8176, 2, now(), now()),  -- mir12345  | 05/21 | 4 passengers
    (4, 4, 8176, 3, now(), now());  -- fehintola | 05/21 | 4 passengers

INSERT INTO `seats` VALUES
    -- seats for reservation: arian123  | 05/07 | 6 passengers
    ( 1, 'A1', 1), ( 2, 'A2', 1), ( 3, 'B1', 1), ( 4, 'B2', 1), ( 5, 'C1', 1), ( 6, 'C2', 1),
    -- seats for reservation: mir12345  | 05/07 | 6 passengers
    ( 7, 'A3', 2), ( 8, 'A4', 2), ( 9, 'B3', 2), (10, 'B4', 2), (11, 'C3', 2), (12, 'C4', 2),
    -- seats for reservation: mir12345  | 05/21 | 4 passengers
    (13, 'A1', 3), (14, 'A2', 3), (15, 'A3', 3), (16, 'A4', 3),
    -- seats for reservation: fehintola | 05/21 | 4 passengers
    (17, 'B1', 4), (18, 'B2', 4), (19, 'B3', 4), (20, 'B4', 4);
