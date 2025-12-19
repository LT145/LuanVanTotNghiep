/*
  Warnings:

  - The values [DRAFT,PAUSED,ENDED] on the enum `PromotionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `variantSizeId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `couponCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `couponDiscount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `couponId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `variantSizeId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `endAt` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `isStackable` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the `Coupon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CouponRedemption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromotionItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `colorVariantId` to the `Promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promotionPrice` to the `Promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PromotionScope" AS ENUM ('ALL_SIZES', 'SPECIFIC_SIZES');

-- AlterEnum
BEGIN;
CREATE TYPE "PromotionStatus_new" AS ENUM ('SCHEDULED', 'ACTIVE', 'EXPIRED', 'DISABLED');
ALTER TABLE "Promotion" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Promotion" ALTER COLUMN "status" TYPE "PromotionStatus_new" USING ("status"::text::"PromotionStatus_new");
ALTER TYPE "PromotionStatus" RENAME TO "PromotionStatus_old";
ALTER TYPE "PromotionStatus_new" RENAME TO "PromotionStatus";
DROP TYPE "PromotionStatus_old";
ALTER TABLE "Promotion" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_variantSizeId_fkey";

-- DropForeignKey
ALTER TABLE "CouponRedemption" DROP CONSTRAINT "CouponRedemption_couponId_fkey";

-- DropForeignKey
ALTER TABLE "CouponRedemption" DROP CONSTRAINT "CouponRedemption_orderId_fkey";

-- DropForeignKey
ALTER TABLE "CouponRedemption" DROP CONSTRAINT "CouponRedemption_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_couponId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantSizeId_fkey";

-- DropForeignKey
ALTER TABLE "PromotionItem" DROP CONSTRAINT "PromotionItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "PromotionItem" DROP CONSTRAINT "PromotionItem_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "PromotionItem" DROP CONSTRAINT "PromotionItem_variantColorId_fkey";

-- DropForeignKey
ALTER TABLE "PromotionItem" DROP CONSTRAINT "PromotionItem_variantSizeId_fkey";

-- DropIndex
DROP INDEX "CartItem_variantSizeId_idx";

-- DropIndex
DROP INDEX "OrderItem_variantSizeId_idx";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "variantSizeId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "couponCode",
DROP COLUMN "couponDiscount",
DROP COLUMN "couponId";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "variantSizeId";

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "description",
DROP COLUMN "endAt",
DROP COLUMN "isStackable",
DROP COLUMN "name",
DROP COLUMN "priority",
DROP COLUMN "startAt",
ADD COLUMN     "colorVariantId" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "promotionPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "scope" "PromotionScope" NOT NULL DEFAULT 'ALL_SIZES',
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- DropTable
DROP TABLE "Coupon";

-- DropTable
DROP TABLE "CouponRedemption";

-- DropTable
DROP TABLE "PromotionItem";

-- DropEnum
DROP TYPE "CouponStatus";

-- DropEnum
DROP TYPE "CouponType";

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "PromotionApplyLevel";

-- CreateTable
CREATE TABLE "PromotionSize" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "sizeId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionSize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromotionSize_promotionId_idx" ON "PromotionSize"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionSize_sizeId_idx" ON "PromotionSize"("sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionSize_promotionId_sizeId_key" ON "PromotionSize"("promotionId", "sizeId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");

-- CreateIndex
CREATE INDEX "OrderHistory_orderId_idx" ON "OrderHistory"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_variantColorId_idx" ON "ProductImage"("variantColorId");

-- CreateIndex
CREATE INDEX "ProductVariantColor_productId_idx" ON "ProductVariantColor"("productId");

-- CreateIndex
CREATE INDEX "ProductVariantSize_colorVariantId_idx" ON "ProductVariantSize"("colorVariantId");

-- CreateIndex
CREATE INDEX "Promotion_productId_idx" ON "Promotion"("productId");

-- CreateIndex
CREATE INDEX "Promotion_colorVariantId_idx" ON "Promotion"("colorVariantId");

-- CreateIndex
CREATE INDEX "Promotion_startDate_endDate_idx" ON "Promotion"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_colorVariantId_fkey" FOREIGN KEY ("colorVariantId") REFERENCES "ProductVariantColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionSize" ADD CONSTRAINT "PromotionSize_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionSize" ADD CONSTRAINT "PromotionSize_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "ProductVariantSize"("id") ON DELETE CASCADE ON UPDATE CASCADE;
