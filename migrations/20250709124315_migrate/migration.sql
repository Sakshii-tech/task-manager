/*
  Warnings:

  - You are about to drop the column `assignee_id` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_assignee_id_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "assignee_id";
