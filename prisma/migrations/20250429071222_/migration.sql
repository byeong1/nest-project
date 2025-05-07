/*
  Warnings:

  - You are about to drop the column `userId` on the `wrong_problem` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `wrong_problem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `wrong_problem` DROP FOREIGN KEY `wrong_problem_userId_fkey`;

-- DropIndex
DROP INDEX `wrong_problem_userId_fkey` ON `wrong_problem`;

-- AlterTable
ALTER TABLE `wrong_problem` DROP COLUMN `userId`,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `wrong_problem` ADD CONSTRAINT `wrong_problem_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
