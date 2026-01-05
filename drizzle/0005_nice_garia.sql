ALTER TABLE "DriverManager" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."driverManagerStatus";--> statement-breakpoint
CREATE TYPE "public"."driverManagerStatus" AS ENUM('occupied', 'available');--> statement-breakpoint
ALTER TABLE "DriverManager" ALTER COLUMN "status" SET DATA TYPE "public"."driverManagerStatus" USING "status"::"public"."driverManagerStatus";