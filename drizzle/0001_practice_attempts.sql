CREATE TABLE `practice_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`at` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `practice_attempts_user_at` ON `practice_attempts` (`user_id`,`at`);