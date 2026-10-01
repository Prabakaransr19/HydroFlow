-- Migration script V3: Create remaining domain tables for apartments, households, tariff_plans, water_usage_logs, billing_cycles, water_purchases, invoices, and alerts

CREATE TABLE IF NOT EXISTS apartments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    total_flats INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS households (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    flat_number VARCHAR(50) NOT NULL,
    floor_number INT NOT NULL DEFAULT 1,
    occupancy INT NOT NULL DEFAULT 1,
    flat_area DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    meter_number VARCHAR(50),
    meter_installation_date DATE,
    meter_status VARCHAR(50) NOT NULL DEFAULT 'NOT_CONFIGURED',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tariff_plans (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    tier1_limit DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    tier1_rate DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    tier2_limit DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    tier2_rate DOUBLE PRECISION NOT NULL DEFAULT 75.0,
    tier3_rate DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS water_usage_logs (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    previous_reading DOUBLE PRECISION NOT NULL,
    current_reading DOUBLE PRECISION NOT NULL,
    water_consumed DOUBLE PRECISION NOT NULL,
    remarks VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_household_reading_date UNIQUE (household_id, reading_date)
);

CREATE TABLE IF NOT EXISTS billing_cycles (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT REFERENCES apartments(id) ON DELETE CASCADE,
    household_id BIGINT REFERENCES households(id) ON DELETE CASCADE,
    billing_month INT NOT NULL,
    billing_year INT NOT NULL,
    due_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    total_consumption DOUBLE PRECISION DEFAULT 0.0,
    total_cost DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS water_purchases (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    billing_cycle_id BIGINT REFERENCES billing_cycles(id) ON DELETE SET NULL,
    purchase_type VARCHAR(50) NOT NULL,
    purchased_volume DOUBLE PRECISION NOT NULL,
    unit_cost DOUBLE PRECISION NOT NULL,
    total_cost DOUBLE PRECISION NOT NULL,
    purchase_date DATE NOT NULL,
    supplier VARCHAR(100),
    remarks VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    billing_cycle_id BIGINT NOT NULL REFERENCES billing_cycles(id) ON DELETE CASCADE,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    resident_name VARCHAR(100),
    flat_number VARCHAR(50),
    billing_month VARCHAR(50),
    consumption DOUBLE PRECISION NOT NULL,
    base_water_charge DOUBLE PRECISION NOT NULL,
    shared_area_charge DOUBLE PRECISION NOT NULL,
    adjustments DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    generated_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    flat_number VARCHAR(50),
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    current_usage DOUBLE PRECISION,
    threshold DOUBLE PRECISION,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE
);
