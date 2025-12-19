-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "failedReason" TEXT;
