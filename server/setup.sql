-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'Users'
--
-- ---

-- DROP TABLE IF EXISTS `Users`;

CREATE TABLE IF NOT EXISTS `Users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `password` MEDIUMTEXT NULL DEFAULT NULL,
  `total_savings` DECIMAL NULL DEFAULT NULL,
  `savings_goal` INTEGER NULL DEFAULT NULL,
  `monthly_limit` DECIMAL NULL DEFAULT NULL,
  `full_name` MEDIUMTEXT NULL DEFAULT NULL,
  `email` MEDIUMTEXT NULL DEFAULT NULL,
  `auth_credential` MEDIUMTEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Expenses'
--
-- ---

-- DROP TABLE IF EXISTS `Expenses`;

CREATE TABLE IF NOT EXISTS `Expenses` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL NULL DEFAULT NULL,
  `category` MEDIUMTEXT NULL DEFAULT NULL,
  `notes` MEDIUMTEXT NULL DEFAULT NULL,
  `spent_date` MEDIUMTEXT NULL DEFAULT NULL,
  `location` MEDIUMTEXT NULL DEFAULT NULL,
  `name` MEDIUMTEXT NULL DEFAULT NULL,
  `recurring_id` INTEGER NULL DEFAULT NULL,
  `user_id` INTEGER NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Incomes'
--
-- ---

-- DROP TABLE IF EXISTS `Incomes`;

CREATE TABLE IF NOT EXISTS `Incomes` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL NULL DEFAULT NULL,
  `category` MEDIUMTEXT NULL DEFAULT NULL,
  `notes` MEDIUMTEXT NULL DEFAULT NULL,
  `income_date` MEDIUMTEXT NULL DEFAULT NULL,
  `location` MEDIUMTEXT NULL DEFAULT NULL,
  `name` MEDIUMTEXT NULL DEFAULT NULL,
  `user_id` INTEGER NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Recurring_Expenses'
--
-- ---

-- DROP TABLE IF EXISTS `Recurring_Expenses`;

CREATE TABLE IF NOT EXISTS `Recurring_Expenses` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL NULL DEFAULT NULL,
  `name` MEDIUMTEXT NULL DEFAULT NULL,
  `due_date` MEDIUMTEXT NULL DEFAULT NULL,
  `notes` MEDIUMTEXT NULL DEFAULT NULL,
  `user_id` INTEGER NULL DEFAULT NULL,
  `category` MEDIUMTEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Goals'
--
-- ---

-- DROP TABLE IF EXISTS `Goals`;

CREATE TABLE IF NOT EXISTS `Goals` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL NULL DEFAULT NULL,
  `name` MEDIUMTEXT NULL DEFAULT NULL,
  `saved_amount` DECIMAL NULL DEFAULT NULL,
  `target_date` MEDIUMTEXT NULL DEFAULT NULL,
  `notes` MEDIUMTEXT NULL DEFAULT NULL,
  `category` MEDIUMTEXT NULL DEFAULT NULL,
  `user_id` INTEGER NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Saved_Stocks'
--
-- ---

-- DROP TABLE IF EXISTS `Saved_Stocks`;

CREATE TABLE IF NOT EXISTS `Saved_Stocks` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `symbol` MEDIUMTEXT NULL DEFAULT NULL,
  `user_id` INTEGER NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Articles'
--
-- ---

-- DROP TABLE IF EXISTS `Articles`;

CREATE TABLE IF NOT EXISTS `Articles` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `url` MEDIUMTEXT NULL DEFAULT NULL,
  `title` MEDIUMTEXT NULL DEFAULT NULL,
  `description` MEDIUMTEXT NULL DEFAULT NULL,
  `icon_path` BLOB NULL DEFAULT NULL,
  `category` MEDIUMTEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Users_Articles'
--
-- ---

-- DROP TABLE IF EXISTS `Users_Articles`;

CREATE TABLE IF NOT EXISTS `Users_Articles` (
  `user_id` INTEGER NULL DEFAULT NULL,
  `article_id` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'Rewards'
--
-- ---

-- DROP TABLE IF EXISTS `Rewards`;

CREATE TABLE IF NOT EXISTS `Rewards` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` MEDIUMTEXT NULL DEFAULT NULL,
  `award_date` DATETIME NULL DEFAULT NULL,
  `type` MEDIUMTEXT NULL DEFAULT NULL,
  `icon_path` MEDIUMTEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Users_Rewards'
--
-- ---

-- DROP TABLE IF EXISTS `Users_Rewards`;

CREATE TABLE IF NOT EXISTS `Users_Rewards` (
  `user_id` INTEGER NULL DEFAULT NULL,
  `reward_id` INTEGER NULL DEFAULT NULL
);

-- ---
-- Foreign Keys
-- ---

ALTER TABLE `Expenses` ADD FOREIGN KEY (recurring_id) REFERENCES `Recurring_Expenses` (`id`);
ALTER TABLE `Expenses` ADD FOREIGN KEY (user_id) REFERENCES `Users` (`id`);
ALTER TABLE `Incomes` ADD FOREIGN KEY (user_id) REFERENCES `Users` (`id`);
ALTER TABLE `Recurring_Expenses` ADD FOREIGN KEY (user_id) REFERENCES `Users` (`id`);
ALTER TABLE `Goals` ADD FOREIGN KEY (user_id) REFERENCES `Users` (`id`);
ALTER TABLE `Saved_Stocks` ADD FOREIGN KEY (user_id) REFERENCES `Users` (`id`);
ALTER TABLE `Users_Articles` ADD FOREIGN KEY (user_id) REFERENCES `Users` (`id`);
ALTER TABLE `Users_Articles` ADD FOREIGN KEY (article_id) REFERENCES `Articles` (`id`);
ALTER TABLE `Users_Rewards` ADD FOREIGN KEY (user_id) REFERENCES `Users` (`id`);
ALTER TABLE `Users_Rewards` ADD FOREIGN KEY (reward_id) REFERENCES `Rewards` (`id`);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE `Users` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Expenses` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Recurring_Expenses` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Goals` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Saved_Stocks` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Articles` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Users_Articles` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Rewards` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Users_Rewards` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `Users` (`id`,`password`,`total_savings`,`savings_goal`,`monthly_limit`,`full_name`,`email`,`auth_credential`) VALUES
-- ('','','','','','','','');
-- INSERT INTO `Expenses` (`id`,`amount`,`category`,`notes`,`spent_date`,`location`,`name`,`recurring_id`,`user_id`) VALUES
-- ('','','','','','','','','');
-- INSERT INTO `Recurring_Expenses` (`id`,`amount`,`name`,`due_date`,`notes`,`user_id`,`category`) VALUES
-- ('','','','','','','');
-- INSERT INTO `Goals` (`id`,`amount`,`name`,`saved_amount`,`target_date`,`notes`,`user_id`) VALUES
-- ('','','','','','','');
-- INSERT INTO `Saved_Stocks` (`id`,`symbol`,`user_id`) VALUES
-- ('','','');
-- INSERT INTO `Articles` (`id`,`url`,`title`,`description`,`icon_path`,`category`) VALUES
-- ('','','','','','');
-- INSERT INTO `Users_Articles` (`user_id`,`article_id`) VALUES
-- ('','');
-- INSERT INTO `Rewards` (`id`,`name`,`award_date`,`type`,`icon_path`) VALUES
-- ('','','','','');
-- INSERT INTO `Users_Rewards` (`user_id`,`reward_id`) VALUES
-- ('','');
