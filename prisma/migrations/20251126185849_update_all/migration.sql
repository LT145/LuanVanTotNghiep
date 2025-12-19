/*
  Warnings:

  - You are about to drop the column `brand` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `ProductVariantSize` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ProductVariantSize_sku_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brand";

-- AlterTable
ALTER TABLE "ProductVariantSize" DROP COLUMN "sku";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
DROP COLUMN "birthDate",
DROP COLUMN "gender",
DROP COLUMN "phone";

-- DropEnum
DROP TYPE "UserGender";
