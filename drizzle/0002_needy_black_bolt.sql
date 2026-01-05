ALTER TABLE "vehicle" ALTER COLUMN "drivermanagerId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "vehicleId" integer;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_vehicleId_vehicle_id_fk" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" DROP COLUMN "orderId";