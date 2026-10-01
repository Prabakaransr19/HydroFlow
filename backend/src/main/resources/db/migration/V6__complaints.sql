CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT REFERENCES households(id) ON DELETE CASCADE,
    apartment_id BIGINT REFERENCES apartments(id) ON DELETE CASCADE,
    raised_by BIGINT REFERENCES users(id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    admin_note TEXT,
    acknowledged_by BIGINT REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
