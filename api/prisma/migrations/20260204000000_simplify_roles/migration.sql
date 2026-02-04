-- Simplify roles: Remove SECTION_LEADER and ALUMNI_GUEST, add STUDENT_GUEST
-- New roles: SUPERADMIN (admin), MEMBER (can contribute), STUDENT_GUEST (view only, default)

-- Step 1: Add the new enum value STUDENT_GUEST
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STUDENT_GUEST';

-- Step 2: Migrate existing users
-- SECTION_LEADER users become SUPERADMIN (they were admins)
UPDATE "users" SET "role" = 'SUPERADMIN' WHERE "role" = 'SECTION_LEADER';

-- ALUMNI_GUEST users become STUDENT_GUEST (view-only)
UPDATE "users" SET "role" = 'STUDENT_GUEST' WHERE "role" = 'ALUMNI_GUEST';

-- Step 3: Alter the default value for new users
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT_GUEST'::"Role";

-- Note: PostgreSQL doesn't support removing enum values directly.
-- The old values (SECTION_LEADER, ALUMNI_GUEST) will remain in the enum type
-- but won't be used. This is a PostgreSQL limitation.
-- To fully remove them, you would need to recreate the enum type,
-- which requires more complex migration with temp columns.
