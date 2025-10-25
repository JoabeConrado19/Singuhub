/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `Package` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "estimatedDelivery" TEXT,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Package name',
ADD COLUMN     "shippingFee" DOUBLE PRECISION,
ADD COLUMN     "stripePaymentStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "stripeSessionId" TEXT,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Package_stripeSessionId_key" ON "Package"("stripeSessionId");
