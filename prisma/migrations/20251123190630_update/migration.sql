/*
  Warnings:

  - You are about to drop the column `parentId` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropIndex
DROP INDEX "public"."Category_gender_idx";

-- DropIndex
DROP INDEX "public"."Category_name_parentId_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "parentId",
ALTER COLUMN "gender" DROP DEFAULT;
