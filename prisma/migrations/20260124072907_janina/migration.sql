/*
  Warnings:

  - You are about to drop the column `vehicleId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `avgWeight` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_vehicleId_fkey";

-- AlterTable
ALTER TABLE "HubManager" ADD COLUMN     "farmId" INTEGER;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "vehicleId";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "avgWeight" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Farm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "farmSize" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "geoLat" DOUBLE PRECISION NOT NULL,
    "expectedHarvestDate" TIMESTAMP(3) NOT NULL,
    "harvestQuantity" INTEGER NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "geoLng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrderToVehicle" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrderToVehicle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderToVehicle_B_index" ON "_OrderToVehicle"("B");

-- AddForeignKey
ALTER TABLE "HubManager" ADD CONSTRAINT "HubManager_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToVehicle" ADD CONSTRAINT "_OrderToVehicle_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToVehicle" ADD CONSTRAINT "_OrderToVehicle_B_fkey" FOREIGN KEY ("B") REFERENCES "vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
