CREATE TABLE IF NOT EXISTS `RoutineStatusUpdownBackup` (`routine_id` text PRIMARY KEY NOT NULL, `status` text NOT NULL);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `RoutineTaskPhaseUpdownBackup` (`routine_task_id` text PRIMARY KEY NOT NULL, `phase` text);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `RoutineTaskCostUnitUpdownBackup` (`routine_task_id` text PRIMARY KEY NOT NULL, `cost_unit` integer NOT NULL);--> statement-breakpoint
ALTER TABLE `RoutineTable` ADD COLUMN `status` text NOT NULL DEFAULT 'Scheduled';--> statement-breakpoint
UPDATE `RoutineTable` SET `status` = (SELECT `status` FROM `RoutineStatusUpdownBackup` WHERE `routine_id` = `RoutineTable`.`id`) WHERE `id` IN (SELECT `routine_id` FROM `RoutineStatusUpdownBackup`);--> statement-breakpoint
ALTER TABLE `RoutineTaskTable` ADD COLUMN `phase` text;--> statement-breakpoint
UPDATE `RoutineTaskTable` SET `phase` = (SELECT `phase` FROM `RoutineTaskPhaseUpdownBackup` WHERE `routine_task_id` = `RoutineTaskTable`.`id`) WHERE `id` IN (SELECT `routine_task_id` FROM `RoutineTaskPhaseUpdownBackup`);--> statement-breakpoint
ALTER TABLE `RoutineTaskTable` ADD COLUMN `cost_unit` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `RoutineTaskTable` SET `cost_unit` = (SELECT `cost_unit` FROM `RoutineTaskCostUnitUpdownBackup` WHERE `routine_task_id` = `RoutineTaskTable`.`id`) WHERE `id` IN (SELECT `routine_task_id` FROM `RoutineTaskCostUnitUpdownBackup`);--> statement-breakpoint
DROP TABLE `RoutineStatusUpdownBackup`;--> statement-breakpoint
DROP TABLE `RoutineTaskPhaseUpdownBackup`;--> statement-breakpoint
DROP TABLE `RoutineTaskCostUnitUpdownBackup`;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `RoutineTimeoutUpdownBackup` (`routine_id` text PRIMARY KEY NOT NULL, `timeout_seconds` integer NOT NULL);--> statement-breakpoint
INSERT OR REPLACE INTO `RoutineTimeoutUpdownBackup` (`routine_id`, `timeout_seconds`) SELECT `id`, `timeout_seconds` FROM `RoutineTable`;--> statement-breakpoint
ALTER TABLE `RoutineTable` DROP COLUMN `timeout_seconds`;
