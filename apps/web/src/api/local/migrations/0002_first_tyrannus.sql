CREATE TABLE `RoutineStatusUpdownBackup` (`routine_id` text PRIMARY KEY NOT NULL, `status` text NOT NULL);--> statement-breakpoint
INSERT INTO `RoutineStatusUpdownBackup` (`routine_id`, `status`) SELECT `id`, `status` FROM `RoutineTable`;--> statement-breakpoint
CREATE TABLE `RoutineTaskPhaseUpdownBackup` (`routine_task_id` text PRIMARY KEY NOT NULL, `phase` text);--> statement-breakpoint
INSERT INTO `RoutineTaskPhaseUpdownBackup` (`routine_task_id`, `phase`) SELECT `id`, `phase` FROM `RoutineTaskTable`;--> statement-breakpoint
CREATE TABLE `RoutineTaskCostUnitUpdownBackup` (`routine_task_id` text PRIMARY KEY NOT NULL, `cost_unit` integer NOT NULL);--> statement-breakpoint
INSERT INTO `RoutineTaskCostUnitUpdownBackup` (`routine_task_id`, `cost_unit`) SELECT `id`, `cost_unit` FROM `RoutineTaskTable`;--> statement-breakpoint
ALTER TABLE `RoutineTable` ADD COLUMN `timeout_seconds` integer NOT NULL DEFAULT 300;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `RoutineTimeoutUpdownBackup` (`routine_id` text PRIMARY KEY NOT NULL, `timeout_seconds` integer NOT NULL);--> statement-breakpoint
UPDATE `RoutineTable` SET `timeout_seconds` = (SELECT `timeout_seconds` FROM `RoutineTimeoutUpdownBackup` WHERE `routine_id` = `RoutineTable`.`id`) WHERE `id` IN (SELECT `routine_id` FROM `RoutineTimeoutUpdownBackup`);--> statement-breakpoint
DROP TABLE `RoutineTimeoutUpdownBackup`;--> statement-breakpoint
ALTER TABLE `RoutineTable` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `RoutineTaskTable` DROP COLUMN `phase`;--> statement-breakpoint
ALTER TABLE `RoutineTaskTable` DROP COLUMN `cost_unit`;
