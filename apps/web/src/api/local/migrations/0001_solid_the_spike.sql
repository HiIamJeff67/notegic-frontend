CREATE TABLE `UserSettingTable` (
	`user_public_id` text PRIMARY KEY NOT NULL,
	`language` text NOT NULL,
	`density` text NOT NULL,
	`start_surface` text NOT NULL,
	`reduce_motion` integer NOT NULL,
	`line_wrap` integer NOT NULL,
	`quick_insert` integer NOT NULL,
	`private_previews` integer NOT NULL,
	`routine_nudges` integer NOT NULL,
	`sync_notifications` integer NOT NULL,
	`quiet_mode` integer NOT NULL,
	`quiet_mode_start_minute` integer NOT NULL,
	`quiet_mode_end_minute` integer NOT NULL,
	FOREIGN KEY (`user_public_id`) REFERENCES `UserTable`(`public_id`) ON UPDATE no action ON DELETE cascade
);
