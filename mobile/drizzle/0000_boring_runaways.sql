CREATE TABLE `recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image` text,
	`ingredients` text NOT NULL,
	`instructions` text NOT NULL,
	`prep_time` text,
	`cook_time` text,
	`total_time` text,
	`recipe_yield` text,
	`url` text,
	`created_at` integer NOT NULL
);
