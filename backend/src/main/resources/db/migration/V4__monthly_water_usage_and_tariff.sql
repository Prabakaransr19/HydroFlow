-- V4__monthly_water_usage_and_tariff.sql
-- Transition water usage logs to monthly consumption records and configure apartment tariff plans

-- Update water_usage_logs table for monthly readings
ALTER TABLE water_usage_logs ADD COLUMN IF NOT EXISTS billing_month INT;
ALTER TABLE water_usage_logs ADD COLUMN IF NOT EXISTS billing_year INT;
ALTER TABLE water_usage_logs ADD COLUMN IF NOT EXISTS consumption DOUBLE PRECISION DEFAULT 0.0;

-- Drop daily unique constraint if exists and add monthly unique constraint
ALTER TABLE water_usage_logs DROP CONSTRAINT IF EXISTS uq_household_date;
ALTER TABLE water_usage_logs DROP CONSTRAINT IF EXISTS uq_household_month_year;
ALTER TABLE water_usage_logs ADD CONSTRAINT uq_household_month_year UNIQUE (household_id, billing_month, billing_year);

-- Ensure tariff_plans table has dynamic tier columns and apartment reference
ALTER TABLE tariff_plans ADD COLUMN IF NOT EXISTS apartment_id BIGINT REFERENCES apartments(id) ON DELETE CASCADE;
ALTER TABLE tariff_plans ADD COLUMN IF NOT EXISTS tier1_max_kl DOUBLE PRECISION DEFAULT 10.0;
ALTER TABLE tariff_plans ADD COLUMN IF NOT EXISTS tier1_rate DOUBLE PRECISION DEFAULT 50.0;
ALTER TABLE tariff_plans ADD COLUMN IF NOT EXISTS tier2_max_kl DOUBLE PRECISION DEFAULT 25.0;
ALTER TABLE tariff_plans ADD COLUMN IF NOT EXISTS tier2_rate DOUBLE PRECISION DEFAULT 75.0;
ALTER TABLE tariff_plans ADD COLUMN IF NOT EXISTS tier3_rate DOUBLE PRECISION DEFAULT 100.0;
