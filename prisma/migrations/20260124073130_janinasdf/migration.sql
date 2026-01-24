/*
  Warnings:

  - Added the required column `avgBuySize` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferedFish` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "avgBuySize" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "preferedFish" TEXT NOT NULL;
