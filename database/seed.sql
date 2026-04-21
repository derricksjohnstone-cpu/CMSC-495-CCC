-- Leave Request Approval System - Seed Data
-- Mirrors the in-memory mock data from backend/app/data/

-- ============================================
-- Users (insert manager first so FK on manager_id works)
-- ============================================
INSERT INTO users (user_id, name, email, password, role, manager_id, department, profile_image) VALUES
    (2, 'Sarah Manager', 'manager@test.com', 'test123', 'Manager', NULL, 'IT', NULL);

INSERT INTO users (user_id, name, email, password, role, manager_id, department, profile_image) VALUES
    (1, 'John Employee', 'employee@test.com', 'test123', 'Employee', 2, 'IT', NULL);

-- Reset the sequence to avoid conflicts with future inserts
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));

-- ============================================
-- Leave Types
-- ============================================
INSERT INTO leave_types (type_id, name) VALUES
    (1, 'Vacation'),
    (2, 'Personal');

SELECT setval('leave_types_type_id_seq', (SELECT MAX(type_id) FROM leave_types));

-- ============================================
-- Leave Requests
-- ============================================
INSERT INTO leave_requests (request_id, user_id, reviewer_id, leave_type, start_date, end_date, leave_mode, description, status, comments) VALUES
    (1, 1, 2, 'Vacation', '2027-04-10', '2027-04-12', 'Full Day', 'Family trip', 'Approved', NULL),
    (2, 1, NULL, 'Personal', '2027-04-20', '2027-04-21', 'Full Day', 'Personal time off', 'Pending', NULL);

SELECT setval('leave_requests_request_id_seq', (SELECT MAX(request_id) FROM leave_requests));

-- ============================================
-- Leave Balances
-- ============================================
INSERT INTO leave_balances (balance_id, user_id, leave_type_id, total_days, used_days, year) VALUES
    (1, 1, 1, 10, 2, 2026),
    (2, 1, 2, 5, 1, 2026),
    (3, 1, 1, 10, 0, 2027),
    (4, 1, 2, 5, 0, 2027);

SELECT setval('leave_balances_balance_id_seq', (SELECT MAX(balance_id) FROM leave_balances));

-- ============================================
-- Request History
-- ============================================
INSERT INTO request_history (history_id, request_id, action, performed_by) VALUES
    (1, 1, 'submitted', 1),
    (2, 1, 'approved', 2);

SELECT setval('request_history_history_id_seq', (SELECT MAX(history_id) FROM request_history));
