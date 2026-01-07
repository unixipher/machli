CREATE TYPE "public"."DriverManagerCategory" AS ENUM('main', 'intermediate');--> statement-breakpoint
CREATE TYPE "public"."driverManagerStatus" AS ENUM('occupied', 'available');--> statement-breakpoint
CREATE TYPE "public"."HubManagerCategory" AS ENUM('main', 'intermediate');--> statement-breakpoint
CREATE TYPE "public"."OrderStatus" AS ENUM('created', 'pending', 'in_transit', 'in_source', 'in_hub', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vehicleStatus" AS ENUM('occupied', 'available');--> statement-breakpoint
CREATE TABLE "DriverManager" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"status" "driverManagerStatus" NOT NULL,
	"phone" varchar NOT NULL,
	"hubmanagerId" integer NOT NULL,
	"address" varchar NOT NULL,
	"geoLat" real NOT NULL,
	"geoLng" real NOT NULL,
	"token" varchar NOT NULL,
	"category" "DriverManagerCategory" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "DriverManager_email_unique" UNIQUE("email"),
	CONSTRAINT "DriverManager_phone_unique" UNIQUE("phone"),
	CONSTRAINT "DriverManager_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "HubManager" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"token" varchar NOT NULL,
	"address" varchar NOT NULL,
	"geoLat" real NOT NULL,
	"geoLng" real NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"hubmanagerCategory" "HubManagerCategory" NOT NULL,
	"mainHubManagerId" integer,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "HubManager_email_unique" UNIQUE("email"),
	CONSTRAINT "HubManager_phone_unique" UNIQUE("phone"),
	CONSTRAINT "HubManager_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopId" integer NOT NULL,
	"hubmanagerId" integer NOT NULL,
	"vehicleId" integer,
	"metadata" json,
	"status" "OrderStatus" DEFAULT 'created' NOT NULL,
	"deliveryDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OrderItem" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OTP" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"otp" varchar NOT NULL,
	"verified" varchar DEFAULT 'false' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"price" real NOT NULL,
	"hubmanagerId" integer NOT NULL,
	"metadata" json,
	"createdAt" timestamp (6) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) DEFAULT now() NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Shop" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"hubmanagerId" integer NOT NULL,
	"geoLat" real NOT NULL,
	"geoLng" real NOT NULL,
	"address" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Shop_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" varchar NOT NULL,
	"model" varchar NOT NULL,
	"drivermanagerId" integer,
	"metadata" json,
	"status" "vehicleStatus" NOT NULL,
	"hubmanagerId" integer NOT NULL,
	"capacity" real NOT NULL,
	"createdAt" timestamp (6) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_number_unique" UNIQUE("number")
);
--> statement-breakpoint
ALTER TABLE "DriverManager" ADD CONSTRAINT "DriverManager_hubmanagerId_HubManager_id_fk" FOREIGN KEY ("hubmanagerId") REFERENCES "public"."HubManager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubManager" ADD CONSTRAINT "HubManager_mainHubManagerId_HubManager_id_fk" FOREIGN KEY ("mainHubManagerId") REFERENCES "public"."HubManager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_Shop_id_fk" FOREIGN KEY ("shopId") REFERENCES "public"."Shop"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_hubmanagerId_HubManager_id_fk" FOREIGN KEY ("hubmanagerId") REFERENCES "public"."HubManager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_vehicleId_vehicle_id_fk" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_hubmanagerId_HubManager_id_fk" FOREIGN KEY ("hubmanagerId") REFERENCES "public"."HubManager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_hubmanagerId_HubManager_id_fk" FOREIGN KEY ("hubmanagerId") REFERENCES "public"."HubManager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_drivermanagerId_DriverManager_id_fk" FOREIGN KEY ("drivermanagerId") REFERENCES "public"."DriverManager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_hubmanagerId_HubManager_id_fk" FOREIGN KEY ("hubmanagerId") REFERENCES "public"."HubManager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_order_product" ON "OrderItem" USING btree ("orderId","productId");