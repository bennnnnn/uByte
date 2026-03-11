-- Rename the legacy stripe_customer_id column to paddle_customer_id.
-- This column has always stored the Paddle customer ID (ctm_...) despite the name.
-- Safe to run multiple times: checks if the column already has the new name.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users RENAME COLUMN stripe_customer_id TO paddle_customer_id;
    RAISE NOTICE 'Renamed stripe_customer_id to paddle_customer_id';
  ELSE
    RAISE NOTICE 'Column paddle_customer_id already exists, skipping rename';
  END IF;
END;
$$;
