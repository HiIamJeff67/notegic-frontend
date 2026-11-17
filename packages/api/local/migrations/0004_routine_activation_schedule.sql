ALTER TABLE `RoutineTable` ADD COLUMN `has_custom_schedule` integer DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE `RoutineTable` SET `has_custom_schedule` = true;
