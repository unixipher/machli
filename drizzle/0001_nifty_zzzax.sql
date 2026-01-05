ALTER TABLE "Shop" DROP CONSTRAINT "Shop_token_unique";--> statement-breakpoint
ALTER TABLE "DriverManager" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "DriverManager" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "HubManager" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "HubManager" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "HubManager" ADD COLUMN "mainHubManagerId" integer;--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "deliveryDate" timestamp;--> statement-breakpoint
ALTER TABLE "HubManager" ADD CONSTRAINT "HubManager_mainHubManagerId_HubManager_id_fk" FOREIGN KEY ("mainHubManagerId") REFERENCES "public"."HubManager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Shop" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "DriverManager" ADD CONSTRAINT "DriverManager_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "DriverManager" ADD CONSTRAINT "DriverManager_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "HubManager" ADD CONSTRAINT "HubManager_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "HubManager" ADD CONSTRAINT "HubManager_phone_unique" UNIQUE("phone");