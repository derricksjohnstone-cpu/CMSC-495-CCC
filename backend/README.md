# Leave Request Approval System - Backend

## Overview

This backend supports the Leave Request Approval System by handling employee leave requests, manager review actions, leave balances, authentication, and request history tracking.

## Tech Stack

- Python
- FastAPI
- Pydantic
- Uvicorn

## Backend Structure

backend/

├── main.py  
├── app/  
│   ├── data/  
│   ├── models/  
│   ├── routes/  
│   └── services/  

### Route Modules

- auth.py  
- leave_balances.py  
- leave_requests.py  
- leave_types.py  
- manager.py  
- users.py  

## Database Setup (Supabase)

1. Get the `.env` file from the team channel in Microsoft Teams and place it in the `backend/` directory. The file is shared — everyone uses the same credentials.

2. Run the schema and seed data via the Supabase SQL Editor:
   - Open your project at https://supabase.com/dashboard
   - Go to SQL Editor
   - Paste and run `database/schema.sql` to create tables
   - Paste and run `database/seed.sql` to insert dev data

## Running the Backend

1. Open a terminal in the backend folder  
2. Activate the virtual environment  
3. Install dependencies:
```bash
pip install -r requirements.txt
```
4. Run the backend server:

```bash
uvicorn main:app --reload
```

5. Open Swagger documentation in the browser:

```
http://127.0.0.1:8000/docs
```

## Implemented Features

- Retrieve all leave requests  
- Retrieve a leave request by ID  
- Create a leave request  
- Approve a pending request  
- Reject a pending request  
- Request revision on a pending request  
- Resubmit a revised request  
- Leave balance validation  
- Half-day leave support  
- Reviewer tracking  
- Request history logging  
- Authentication endpoint  

## Testing

Backend functionality has been verified through:

- Local backend execution
- Manual API testing using FastAPI Swagger documentation
- Functional validation of leave request workflows

## Current Status

The backend API structure and core workflow logic are implemented and ready for integration with the frontend and database layer.