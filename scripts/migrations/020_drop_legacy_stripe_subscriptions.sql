-- Migration 020: Drop the legacy Stripe subscriptions table.
-- Billing has been fully migrated to Paddle. All subscription state is stored on
-- the users table (plan, paddle_customer_id, subscription_expires_at) and the
-- paddle_webhook_events table. The old `subscriptions` table is unused.

DROP TABLE IF EXISTS subscriptions;
