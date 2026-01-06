ALTER TABLE "DriverManager" ADD COLUMN "hubmanagerId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicle" ADD COLUMN "hubmanagerId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "DriverManager" ADD CONSTRAINT "DriverManager_hubmanagerId_HubManager_id_fk" FOREIGN KEY ("hubmanagerId") REFERENCES "public"."HubManager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_hubmanagerId_HubManager_id_fk" FOREIGN KEY ("hubmanagerId") REFERENCES "public"."HubManager"("id") ON DELETE no action ON UPDATE no action;