CREATE TABLE resident_invitations (

    id BIGSERIAL PRIMARY KEY,

    resident_name VARCHAR(255) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    token VARCHAR(255) UNIQUE NOT NULL,

    status VARCHAR(50) NOT NULL,

    created_at TIMESTAMP NOT NULL

);