-- Create the UserRole enum type
CREATE TYPE "UserRole" AS ENUM ('restricted', 'user');

-- Create a temporary column with the new enum type
ALTER TABLE "user" ADD COLUMN "role_new" "UserRole";

-- Convert existing role values to the new enum type
UPDATE "user" SET "role_new" = 
  CASE 
    WHEN role = 'restricted' THEN 'restricted'::"UserRole"
    WHEN role = 'user' THEN 'user'::"UserRole"
    ELSE 'restricted'::"UserRole"
  END;

-- Drop the old role column and rename the new one
ALTER TABLE "user" DROP COLUMN "role";
ALTER TABLE "user" RENAME COLUMN "role_new" TO "role";

-- Set the default value and not null constraint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'restricted'::"UserRole";
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL; 