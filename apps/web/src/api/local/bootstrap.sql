CREATE TABLE `BlockPackTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_sub_shelf_id` text NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`icon` text,
	`header_background_url` text,
	`block_count` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.140Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.140Z"' NOT NULL,
	FOREIGN KEY (`parent_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade
);

CREATE INDEX `block_pack_parent_sub_shelf_idx` ON `BlockPackTable` (`parent_sub_shelf_id`);
CREATE TABLE `ItemTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_sub_shelf_id` text NOT NULL,
	`root_shelf_id` text NOT NULL,
	`type` text NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.262Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.262Z"' NOT NULL,
	FOREIGN KEY (`parent_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `item_parent_sub_shelf_idx` ON `ItemTable` (`parent_sub_shelf_id`);
CREATE INDEX `item_root_shelf_idx` ON `ItemTable` (`root_shelf_id`);
CREATE TABLE `RootShelfTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`sub_shelf_count` integer DEFAULT 0 NOT NULL,
	`item_count` integer DEFAULT 0 NOT NULL,
	`last_analyzed_count` integer DEFAULT '"2026-09-10T06:37:14.144Z"' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.144Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.144Z"' NOT NULL
);

CREATE TABLE `RoutineTable` (
	`id` text PRIMARY KEY NOT NULL,
	`station_id` text NOT NULL,
	`title` text DEFAULT 'undefined' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Scheduled' NOT NULL,
	`phase` text,
	`is_pinned` integer DEFAULT false NOT NULL,
	`scheduled_start_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	`scheduled_end_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	`period` text,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	FOREIGN KEY (`station_id`) REFERENCES `StationTable`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `routine_station_idx` ON `RoutineTable` (`station_id`);
CREATE TABLE `RoutinesToItemsTable` (
	`routine_id` text NOT NULL,
	`item_id` text NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.260Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `ItemTable`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `routines_to_items_routine_idx` ON `RoutinesToItemsTable` (`routine_id`);
CREATE INDEX `routines_to_items_item_idx` ON `RoutinesToItemsTable` (`item_id`);
CREATE TABLE `RoutinesToTags` (
	`routine_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `RoutineTag`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `routines_to_tags_routine_idx` ON `RoutinesToTags` (`routine_id`);
CREATE INDEX `routines_to_tags_tag_idx` ON `RoutinesToTags` (`tag_id`);
CREATE TABLE `RoutinesToTasksTable` (
	`routine_id` text NOT NULL,
	`task_id` text NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `RoutineTaskTable`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `routines_to_tasks_routine_idx` ON `RoutinesToTasksTable` (`routine_id`);
CREATE INDEX `routines_to_tasks_task_idx` ON `RoutinesToTasksTable` (`task_id`);
CREATE TABLE `RoutineTag` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_public_id` text,
	`name` text DEFAULT 'undefined' NOT NULL,
	`color` text(7) DEFAULT '#FFFFFF' NOT NULL,
	`icon` text,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	FOREIGN KEY (`owner_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `RoutineTaskTable` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text NOT NULL,
	`title` text DEFAULT 'undefined' NOT NULL,
	`purpose` text NOT NULL,
	`phase` text,
	`cost_unit` integer DEFAULT 0 NOT NULL,
	`payload` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 1 NOT NULL,
	`previous_routine_task_ids` text DEFAULT '[]' NOT NULL,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `routine_task_routine_idx` ON `RoutineTaskTable` (`routine_id`);
CREATE TABLE `RoutineDependencyTable` (
	`routine_task_id` text NOT NULL,
	`previous_routine_task_id` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.264Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.264Z"' NOT NULL,
	PRIMARY KEY(`routine_task_id`, `previous_routine_task_id`),
	FOREIGN KEY (`routine_task_id`) REFERENCES `RoutineTaskTable`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`previous_routine_task_id`) REFERENCES `RoutineTaskTable`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `routine_dependency_idx_previous_routine_task_id` ON `RoutineDependencyTable` (`previous_routine_task_id`);
CREATE TABLE `RoutineTaskDependencyGraphDraftTable` (
	`routine_id` text PRIMARY KEY NOT NULL,
	`nodes` text DEFAULT '[]' NOT NULL,
	`edges` text DEFAULT '[]' NOT NULL,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.270Z"' NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `RoutineTable`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `StationTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`icon` text,
	`header_background_url` text,
	`routine_count` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL
);

CREATE TABLE `SubShelfTable` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`root_shelf_id` text NOT NULL,
	`prev_sub_shelf_id` text,
	`path` text DEFAULT '[]' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.262Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.262Z"' NOT NULL,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`prev_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade
);

CREATE INDEX `sub_shelf_root_shelf_idx` ON `SubShelfTable` (`root_shelf_id`);
CREATE INDEX `sub_shelf_prev_idx` ON `SubShelfTable` (`prev_sub_shelf_id`);
CREATE TABLE `TestTable` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'unknown' NOT NULL,
	`content` text,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.271Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.271Z"' NOT NULL
);

CREATE TABLE `TransactionTable` (
	`sequence` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_public_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`action_type` text NOT NULL,
	`body` text NOT NULL,
	`affected` text,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.274Z"' NOT NULL,
	FOREIGN KEY (`owner_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `transaction_owner_retry_idx` ON `TransactionTable` (`owner_public_id`,`retry_count`);
CREATE TABLE `UserTable` (
	`public_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'Online' NOT NULL,
	`is_logged_in` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL
);

CREATE UNIQUE INDEX `UserTable_name_unique` ON `UserTable` (`name`);
CREATE UNIQUE INDEX `UserTable_email_unique` ON `UserTable` (`email`);
CREATE UNIQUE INDEX `user_unique_idx_is_logged_in` ON `UserTable` (`is_logged_in`) WHERE "UserTable"."is_logged_in" = ?;
CREATE TABLE `UsersToShelvesTable` (
	`user_public_id` text NOT NULL,
	`root_shelf_id` text NOT NULL,
	`permission` text NOT NULL,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.276Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.276Z"' NOT NULL,
	PRIMARY KEY(`user_public_id`, `root_shelf_id`),
	FOREIGN KEY (`user_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `users_to_shelves_root_shelf_idx` ON `UsersToShelvesTable` (`root_shelf_id`);
CREATE UNIQUE INDEX `users_to_shelves_unique_idx_root_shelf_owner` ON `UsersToShelvesTable` (`root_shelf_id`) WHERE "UsersToShelvesTable"."permission" = ?;
CREATE TABLE `UsersToStationsTable` (
	`user_public_id` text NOT NULL,
	`station_id` text NOT NULL,
	`permission` text NOT NULL,
	`updated_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-09-10T06:37:14.259Z"' NOT NULL,
	PRIMARY KEY(`user_public_id`, `station_id`),
	FOREIGN KEY (`user_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`station_id`) REFERENCES `StationTable`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `users_to_stations_station_idx` ON `UsersToStationsTable` (`station_id`);
CREATE UNIQUE INDEX `users_to_stations_unique_idx_station_owner` ON `UsersToStationsTable` (`station_id`) WHERE "UsersToStationsTable"."permission" = ?;
