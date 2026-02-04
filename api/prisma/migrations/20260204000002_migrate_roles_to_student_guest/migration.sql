-- Step 2: Migrate existing users (now that STUDENT_GUEST is committed)
-- SECTION_LEADER users become SUPERADMIN (they were admins)
UPDATE "users" SET "role" = 'SUPERADMIN' WHERE "role" = 'SECTION_LEADER';

-- ALUMNI_GUEST users become STUDENT_GUEST (view-only)
UPDATE "users" SET "role" = 'STUDENT_GUEST' WHERE "role" = 'ALUMNI_GUEST';

-- Step 3: Alter the default value for new users
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT_GUEST'::"Role";

-- Note: PostgreSQL doesn't support removing enum values directly.
-- The old values (SECTION_LEADER, ALUMNI_GUEST) will remain in the enum type
-- but won't be used. This is a PostgreSQL limitation.
