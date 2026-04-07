Leave Request Approval System
Group 3 - CMSC 495 Capstone (Spring 2026)

1. Project Overview
This web application allows employees to submit time-off requests and managers to review, approve, or reject them. The system tracks request statuses and provides visibility into team availability via a team calendar.

2. Tech Stack
Frontend: React (Next.js), TypeScript, Tailwind CSS
Backend: Python with FastAPI
Database: PostgreSQL (hosted on Supabase)
Version Control: Git and GitHub

Database Connection: Direct PostgreSQL via psycopg2 with connection pooling.
See `backend/README.md` for Supabase setup instructions.

3. Core Functional Requirements
Employee Role
Submit leave requests (Vacation or Personal)
Select start and end dates.
View request history and received feedback.

Manager Role
Dashboard to view all submitted requests.
Approve, Reject, or Request Revisions with comments.
View scheduling conflicts and team calendar.

4. System Statuses
All requests must transition through: Pending, Approved, Rejected, and Revision Requested.
