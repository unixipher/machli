-- CreateEnum
CREATE TYPE "DriverManagerCategory" AS ENUM ('main', 'intermediate');

-- CreateEnum
CREATE TYPE "HubManagerCategory" AS ENUM ('main', 'intermediate');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('created', 'pending', 'in_transit', 'in_source', 'in_hub', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('occupied', 'available');

-- CreateEnum
CREATE TYPE "DriverManagerStatus" AS ENUM ('occupied', 'available');

-- CreateTable
CREATE TABLE "HubManager" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "geoLat" DOUBLE PRECISION NOT NULL,
    "geoLng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hubmanagerCategory" "HubManagerCategory" NOT NULL,
    "mainHubManagerId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverManager" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "DriverManagerStatus" NOT NULL,
    "phone" TEXT NOT NULL,
    "hubmanagerId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "geoLat" DOUBLE PRECISION NOT NULL,
    "geoLng" DOUBLE PRECISION NOT NULL,
    "token" TEXT NOT NULL,
    "category" "DriverManagerCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "hubmanagerId" INTEGER NOT NULL,
    "geoLat" DOUBLE PRECISION NOT NULL,
    "geoLng" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "hubmanagerId" INTEGER NOT NULL,
    "vehicleId" INTEGER,
    "metadata" JSONB,
    "status" "OrderStatus" NOT NULL DEFAULT 'created',
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "drivermanagerId" INTEGER,
    "metadata" JSONB,
    "status" "VehicleStatus" NOT NULL,
    "hubmanagerId" INTEGER NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "hubmanagerId" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "verified" TEXT NOT NULL DEFAULT 'false',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HubManager_email_key" ON "HubManager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HubManager_phone_key" ON "HubManager"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "HubManager_token_key" ON "HubManager"("token");

-- CreateIndex
CREATE UNIQUE INDEX "DriverManager_email_key" ON "DriverManager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DriverManager_phone_key" ON "DriverManager"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "DriverManager_token_key" ON "DriverManager"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_phone_key" ON "Shop"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_number_key" ON "vehicle"("number");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_productId_key" ON "OrderItem"("orderId", "productId");

-- AddForeignKey
ALTER TABLE "HubManager" ADD CONSTRAINT "HubManager_mainHubManagerId_fkey" FOREIGN KEY ("mainHubManagerId") REFERENCES "HubManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverManager" ADD CONSTRAINT "DriverManager_hubmanagerId_fkey" FOREIGN KEY ("hubmanagerId") REFERENCES "HubManager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_hubmanagerId_fkey" FOREIGN KEY ("hubmanagerId") REFERENCES "HubManager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_hubmanagerId_fkey" FOREIGN KEY ("hubmanagerId") REFERENCES "HubManager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_drivermanagerId_fkey" FOREIGN KEY ("drivermanagerId") REFERENCES "DriverManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_hubmanagerId_fkey" FOREIGN KEY ("hubmanagerId") REFERENCES "HubManager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_hubmanagerId_fkey" FOREIGN KEY ("hubmanagerId") REFERENCES "HubManager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
