-- Migration 001: Initial Schema
-- Down migration — drops all tables in reverse dependency order

DROP TABLE IF EXISTS request_history;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;
