-- Step 1: Add the new enum value STUDENT_GUEST
-- This must be in a separate transaction before it can be used
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STUDENT_GUEST';
