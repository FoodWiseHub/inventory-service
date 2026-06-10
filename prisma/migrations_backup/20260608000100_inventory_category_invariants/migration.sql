ALTER TABLE "inventory_domain"."inventory_categories"
ADD CONSTRAINT "inventory_categories_scope_owner_system_code_check"
CHECK (
  (
    "scope" = 'SYSTEM'
    AND "owner_user_id" IS NULL
    AND "system_code" IS NOT NULL
  )
  OR
  (
    "scope" = 'USER'
    AND "owner_user_id" IS NOT NULL
    AND "system_code" IS NULL
  )
);
