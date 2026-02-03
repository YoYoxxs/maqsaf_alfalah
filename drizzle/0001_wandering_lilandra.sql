CREATE TABLE `pointsHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`amount` int NOT NULL,
	`reason` text NOT NULL,
	`actionBy` text NOT NULL,
	`actionByRole` enum('teacher','principal','system') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pointsHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` text NOT NULL,
	`nameEn` text NOT NULL,
	`grade` int NOT NULL,
	`section` varchar(10) NOT NULL,
	`school` text NOT NULL DEFAULT ('مدرسة الفلاح الخاصة'),
	`points` int NOT NULL DEFAULT 0,
	`parentName` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`itemName` text NOT NULL,
	`itemNameEn` text NOT NULL,
	`pointsSpent` int NOT NULL,
	`transactionDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
