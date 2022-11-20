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
    `email` varchar(255) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `firstName` varchar(255) NOT NULL,
    `lastName` varchar(255) NOT NULL,
    PRIMARY KEY (`username`)
);

CREATE TABLE planner.blogs (
   `blogid` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `subject` varchar(50) DEFAULT NULL,
   `description` varchar(250) DEFAULT NULL,
   `pdate` date DEFAULT NULL,
   `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`blogid`),
  KEY `FK1_idx` (`description`),
  KEY `FK1` (`created_by`),
  CONSTRAINT `FK1` FOREIGN KEY (`created_by`) REFERENCES planner.user(`username`)
);

CREATE TABLE planner.blogstags (
  `blogid` int(10) unsigned NOT NULL,
  `tag` varchar(20) NOT NULL,
  PRIMARY KEY (`blogid`,`tag`),
  CONSTRAINT `blogstags_ibfk_1` FOREIGN KEY (`blogid`) REFERENCES planner.blogs(`blogid`)
);

CREATE TABLE planner.comments (
  `commentid` int(10) NOT NULL AUTO_INCREMENT,
  `sentiment` varchar(20) DEFAULT NULL,
  `description` varchar(250) DEFAULT NULL,
  `cdate` date DEFAULT NULL,
  `blogid` int(10) unsigned DEFAULT NULL,
  `posted_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`commentid`),
  KEY `comments_ibfk_1` (`blogid`),
  KEY `comments_ibfk_2` (`posted_by`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`blogid`) REFERENCES planner.blogs(`blogid`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`posted_by`) REFERENCES planner.user(`username`),
  CONSTRAINT `sentiment_types` CHECK ((`sentiment` in (_utf8mb4'negative',_utf8mb4'positive')))
);
