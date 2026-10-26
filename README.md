# TaskFlow — Full-Stack Task Management System

A full-stack task management application that helps admins manage users, assign tasks, track progress, and monitor team workload through a centralized dashboard.

Built with **React, Node.js, Express.js, and MySQL**, TaskFlow includes JWT authentication, role-based authorization, task status tracking, and a Kanban board with drag-and-drop functionality.

## Features

### Authentication & Security
- JWT-based user authentication.
- Password hashing with bcrypt.
- Role-based access control for admins and users.
- Protected frontend routes and backend API endpoints.
- Inactive user accounts cannot log in or continue using existing authenticated sessions.

### Task Management
- Create, assign, edit, and manage tasks.
- Organize tasks by status using a Kanban board.
- Drag and drop tasks between workflow columns.
- Persist task status changes through the backend API.
- View task details, assignees, and due dates.
- Filter, sort, and paginate task lists.

### Admin Dashboard
- View task statistics and progress.
- Monitor team workload.
- Add new users.
- Activate or deactivate user accounts.
- Manage team members while preserving their task history.

### Backend & Database
- RESTful API built with Express.js.
- MySQL database with relational tables and foreign keys.
- SQL JOINs to retrieve task and assignee information.
- Layered architecture: routes → controllers → services → models.
- Centralized error handling and input validation.
- Activity logging support.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, React Router |
| API Communication | Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8, mysql2 |
| Authentication | JWT, bcrypt |
| Development | Git, npm, Postman |
| Optional Local Setup | Docker, Docker Compose |

## Project Structure

```text
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql
├── postman/
│   └── Employee-Task-Tracker.postman_collection.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MySQL 8 or a compatible MySQL server
- Git

Docker is optional if you choose the Docker-based setup.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rudra-web01/Task-tracker.git
cd Task-tracker
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Configure the database

Start MySQL and create the database and tables using the project's SQL schema:

```bash
mysql -u root -p < database/schema.sql
```

Enter your MySQL password when prompted.

Alternatively, use the backend migration script if your project configuration supports it:

```bash
cd backend
npm install
npm run migrate
```

**Important:** Run database setup only after reviewing your existing database configuration. Do not run seed or reset scripts against a database containing data you want to preserve.

### 3. Configure the backend

From the `backend` directory, create your local environment file using `.env.example` as a template.

In PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and configure the variables required by your application, including your database connection settings and JWT secret.

Install dependencies and start the backend:

```bash
npm install
npm run dev
```

The API is expected to run at:

```text
http://localhost:5000
```

### 4. Configure the frontend

Open a second terminal from the project root:

```bash
cd frontend
```

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

Configure the frontend API URL in `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000
```

Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

### 5. Demo accounts

If the demo data has already been created in your local database, use the credentials configured by the project.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `password123` |
| User | `aisha@demo.com` | `password123` |
| User | `ben@demo.com` | `password123` |
| User | `chen@demo.com` | `password123` |

These are development/demo credentials only. Do not use them for a public production deployment. Confirm that these accounts exist before relying on them.

## API Overview

The backend exposes REST endpoints for authentication, users, tasks, and activity logs.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Retrieve the authenticated user |
| GET | `/users` | List users (admin access) |
| GET | `/users/:id/tasks` | Retrieve a user's tasks |
| PATCH | `/users/:id/status` | Activate or deactivate a user |
| POST | `/tasks` | Create a task |
| GET | `/tasks` | Retrieve tasks available to the current user |
| GET | `/tasks/:id` | Retrieve task details |
| PUT | `/tasks/:id` | Update a task |
| GET | `/activity-logs` | Retrieve activity logs (admin access) |

Protected endpoints require a valid JWT:

```http
Authorization: Bearer <your_token>
```

Access permissions and request validation are enforced by the backend. Refer to the route and service implementations for the exact requirements of each endpoint.

## Database Design

The database includes the following core tables:

- **users** — user details, roles, and account activation status.
- **tasks** — task information, assignment, status, and due dates.
- **activity_logs** — records of relevant application activity.

Foreign keys maintain relationships between tasks and users. SQL JOINs allow the API to return task information alongside assignee details.

The database schema is available in [`database/schema.sql`](database/schema.sql).

## Testing with Postman

Import the Postman collection from:

[`postman/Employee-Task-Tracker.postman_collection.json`](postman/Employee-Task-Tracker.postman_collection.json)

Set the collection's base URL to your running backend. Authenticate first and use the returned JWT for protected requests.

## Environment Variables & Security

- Keep `.env` files local and out of version control.
- Use `.env.example` to document the required variable names without including real secrets.
- Never commit database passwords, production JWT secrets, or API keys.
- Configure production environment variables through your hosting provider's environment settings.
- Use a strong, unique JWT secret in production.
- Replace demo credentials and disable public demo access where appropriate.

## Future Improvements

- Add automated backend and frontend tests.
- Improve dashboard responsiveness and accessibility.
- Add task notifications and deadline reminders.
- Introduce more detailed reporting and analytics.
- Deploy the frontend, backend, and database using production-ready configurations.

## Author

**Prince Mishra**

B.Tech Computer Science & Engineering

GitHub: [rudra-web01](https://github.com/rudra-web01)

---

*TaskFlow is a full-stack project built to demonstrate REST API development, database integration, authentication, authorization, and interactive task management.*
