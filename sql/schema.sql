DROP DATABASE planner;
CREATE DATABASE planner;

CREATE TABLE planner.tasks (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `board_id` int(10) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` varchar(45) DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE planner.boards (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE planner.user (
    `username` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL UNIQUE ,
    `password` varchar(255) NOT NULL,
    `firstName` varchar(255) NOT NULL,
    `lastName` varchar(255) NOT NULL,
    PRIMARY KEY (`username`)
);
