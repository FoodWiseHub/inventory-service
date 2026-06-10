CREATE UNIQUE INDEX IF NOT EXISTS "inventory_item_photos_one_primary_per_item"
ON "inventory_domain"."inventory_item_photos" ("item_id")
WHERE "is_primary" = true;
