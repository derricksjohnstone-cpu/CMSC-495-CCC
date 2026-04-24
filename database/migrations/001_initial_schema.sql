-- Migration 001: Initial Schema
-- Up migration — creates all tables and indexes

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Employee', 'Manager')),
    manager_id INT REFERENCES users(user_id),
    department VARCHAR(100),
    profile_image VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS leave_types (
    type_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS leave_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    reviewer_id INT REFERENCES users(user_id),
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    leave_mode VARCHAR(20) DEFAULT 'Full Day',
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Revision Requested')),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_balances (
    balance_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    leave_type_id INT NOT NULL REFERENCES leave_types(type_id),
    total_days INT NOT NULL DEFAULT 0,
    used_days INT NOT NULL DEFAULT 0,
    year INT NOT NULL,
    UNIQUE (user_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS request_history (
    history_id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES leave_requests(request_id),
    action VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by INT REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_reviewer ON leave_requests(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user ON leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_type ON leave_balances(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_request_history_request ON request_history(request_id);
CREATE INDEX IF NOT EXISTS idx_request_history_performer ON request_history(performed_by);
