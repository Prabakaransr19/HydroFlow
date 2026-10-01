CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY, -- auto-incrementing primary key
    name VARCHAR(50) NOT NULL ,
    email VARCHAR(100) NOT NULL UNIQUE, --login identifier
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL , -- 'PENDING', 'APPROVED', 'REJECTED'
    created_at TIMESTAMP NOT NULL
);