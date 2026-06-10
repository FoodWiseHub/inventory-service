ALTER TABLE "inventory_domain"."inventory_items"
ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;
