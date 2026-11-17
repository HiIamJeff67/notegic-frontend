CREATE TABLE `MaterialTable` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_sub_shelf_id` text NOT NULL,
	`root_shelf_id` text NOT NULL,
	`name` text DEFAULT 'undefined' NOT NULL,
	`size` integer DEFAULT 0 NOT NULL,
	`content_type` text DEFAULT 'text/plain' NOT NULL,
	`parse_media_type` text DEFAULT '' NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`deleted_at` integer,
	`updated_at` integer DEFAULT '"2026-11-04T00:25:20.516Z"' NOT NULL,
	`created_at` integer DEFAULT '"2026-11-04T00:25:20.516Z"' NOT NULL,
	FOREIGN KEY (`parent_sub_shelf_id`) REFERENCES `SubShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`root_shelf_id`) REFERENCES `RootShelfTable`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `material_parent_sub_shelf_idx` ON `MaterialTable` (`parent_sub_shelf_id`);--> statement-breakpoint
CREATE INDEX `material_root_shelf_idx` ON `MaterialTable` (`root_shelf_id`);
