-- Table: Users
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL -- 'Employee' or 'Manager'
);

-- Table: Leave_Requests
CREATE TABLE Leave_Requests (
    request_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(user_id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- 'Vacation' or 'Personal'
    status VARCHAR(50) DEFAULT 'Pending',
    comments TEXT -- Manager comments for feedback
);
