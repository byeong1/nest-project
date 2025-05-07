/*
  Warnings:

  - Added the required column `grade` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stage` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `grade` VARCHAR(191) NOT NULL,
    ADD COLUMN `stage` VARCHAR(191) NOT NULL;
