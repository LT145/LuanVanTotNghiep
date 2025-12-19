/*
  Warnings:

  - You are about to drop the column `gender` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Product_gender_categoryId_isActive_idx";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'UNISEX';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "gender";

-- CreateIndex
CREATE INDEX "Category_gender_idx" ON "Category"("gender");
