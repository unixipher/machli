/*
  Warnings:

  - The `verified` column on the `OTP` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `preferedFish` on the `Shop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OTP" DROP COLUMN "verified",
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shopId" INTEGER;

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "preferedFish";

-- CreateTable
CREATE TABLE "_PreferredProducts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PreferredProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PreferredProducts_B_index" ON "_PreferredProducts"("B");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredProducts" ADD CONSTRAINT "_PreferredProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredProducts" ADD CONSTRAINT "_PreferredProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
