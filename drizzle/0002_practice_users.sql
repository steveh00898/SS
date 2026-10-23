CREATE TABLE `practice_users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text,
	`name` text DEFAULT '' NOT NULL,
	`first_seen` text NOT NULL,
	`last_seen` text NOT NULL
);
