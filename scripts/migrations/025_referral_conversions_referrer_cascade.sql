-- Deleting a user who referred others failed with a foreign key violation on
-- referral_conversions.referrer_id (no ON DELETE behavior). Cascade removes
-- conversion rows when the referrer account is deleted.

ALTER TABLE referral_conversions
  DROP CONSTRAINT IF EXISTS referral_conversions_referrer_id_fkey;

ALTER TABLE referral_conversions
  ADD CONSTRAINT referral_conversions_referrer_id_fkey
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE;
