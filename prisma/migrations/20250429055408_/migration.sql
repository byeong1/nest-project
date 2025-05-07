/*
  Warnings:

  - You are about to drop the column `user_id` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_user_id_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `user_id`,
    ADD COLUMN `account_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_account_id_key` ON `User`(`account_id`);
