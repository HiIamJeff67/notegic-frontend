ALTER TABLE `TransactionTable` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `TransactionTable` ADD `depends_on_sequence` integer;
