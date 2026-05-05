===============================================================================
                    TASKFLOW - TEAM TASK MANAGER
                    Full-Stack Web Application
===============================================================================

LIVE URL: https://team-task-manager-uaso.onrender.com/
GITHUB REPO: https://github.com/aggarwalhardik2005/TaskFlow

===============================================================================
PROJECT OVERVIEW
===============================================================================

TaskFlow is a full-stack Team Task Manager web application where users can 
create projects, assign tasks, and track progress with role-based access 
control (Admin/Member).

===============================================================================
TECH STACK
===============================================================================

Frontend:
  - React 18 (with Vite build tool)
  - React Router DOM v6 (client-side routing)
  - Axios (HTTP client)
  - React Icons (icon library)
  - React Hot Toast (notifications)
  - Vanilla CSS (custom dark theme design system)

Backend:
  - Node.js
  - Express.js (REST API framework)
  - MongoDB with Mongoose ODM (database)
  - JSON Web Tokens - JWT (authentication)
  - bcryptjs (password hashing)
  - cors (cross-origin resource sharing)
  - dotenv (environment variables)

Deployment:
  - Railway (fullstack deployment)
  - MongoDB Atlas (cloud database)

===============================================================================
KEY FEATURES
===============================================================================

1. AUTHENTICATION
   - User signup with role selection (Admin/Member)
   - User login with JWT token-based authentication
   - Protected routes (frontend and backend)
   - Profile management

2. PROJECT & TEAM MANAGEMENT
   - Create, edit, and delete projects
   - Add/remove team members to projects
   - Project color coding and deadline tracking
   - Progress visualization with completion percentage

3. TASK MANAGEMENT
   - Create tasks within projects
   - Assign tasks to team members
   - Set priority levels (Low, Medium, High, Critical)
   - Due date tracking with overdue detection
   - Kanban board view (To Do, In Progress, Review, Done)
   - Table view with search and filters

4. DASHBOARD
   - Overview stats (total tasks, projects, members)
   - Task status distribution
   - Priority breakdown
   - Completion rate with progress bar
   - Overdue task alerts
   - Recent activity feed

5. ROLE-BASED ACCESS CONTROL (RBAC)
   - Admin: Full CRUD on all resources, manage users and roles
   - Member: Create tasks, update assigned tasks, view projects

===============================================================================
FOLDER STRUCTURE
===============================================================================

team-task-manager/
|-- .env                        # Environment variables
|-- .gitignore                  # Git ignore rules
|-- package.json                # Root package.json (server deps + scripts)
|-- README.txt                  # This file
|
|-- server/                     # Backend (Express.js)
|   |-- server.js               # Entry point
|   |-- config/
|   |   |-- db.js               # MongoDB connection
|   |-- controllers/
|   |   |-- authController.js   # Auth logic
|   |   |-- projectController.js# Project CRUD
|   |   |-- taskController.js   # Task CRUD + dashboard stats
|   |   |-- userController.js   # User management
|   |-- middleware/
|   |   |-- auth.js             # JWT verify, admin guard, project member check
|   |-- models/
|   |   |-- User.js             # User schema
|   |   |-- Project.js          # Project schema
|   |   |-- Task.js             # Task schema
|   |-- routes/
|   |   |-- authRoutes.js       # /api/auth/*
|   |   |-- projectRoutes.js    # /api/projects/*
|   |   |-- taskRoutes.js       # /api/tasks/*
|   |   |-- userRoutes.js       # /api/users/*
|   |-- utils/
|       |-- generateToken.js    # JWT token generator
|
|-- client/                     # Frontend (React + Vite)
    |-- index.html              # HTML entry
    |-- vite.config.js          # Vite configuration
    |-- package.json            # Client dependencies
    |-- public/
    |   |-- vite.svg            # Favicon
    |-- src/
        |-- main.jsx            # React entry
        |-- App.jsx             # Root component + routing
        |-- index.css           # Complete design system
        |-- context/
        |   |-- AuthContext.jsx  # Auth state management
        |-- services/
        |   |-- api.js          # Axios instance with JWT interceptor
        |-- components/
        |   |-- Layout.jsx      # App layout with sidebar
        |-- pages/
            |-- Login.jsx       # Login page
            |-- Register.jsx    # Registration page
            |-- Dashboard.jsx   # Dashboard with stats
            |-- Projects.jsx    # Projects list
            |-- ProjectDetail.jsx # Kanban board
            |-- Tasks.jsx       # All tasks table view
            |-- Team.jsx        # Team management
            |-- Profile.jsx     # User profile

===============================================================================
API ENDPOINTS
===============================================================================

Auth:
  POST   /api/auth/register     - Register new user
  POST   /api/auth/login        - Login user
  GET    /api/auth/me           - Get current user profile
  PUT    /api/auth/profile      - Update profile

Projects:
  GET    /api/projects          - Get all projects (user's)
  POST   /api/projects          - Create project
  GET    /api/projects/:id      - Get single project with tasks
  PUT    /api/projects/:id      - Update project
  DELETE /api/projects/:id      - Delete project + tasks
  POST   /api/projects/:id/members       - Add member
  DELETE /api/projects/:id/members/:uid  - Remove member

Tasks:
  GET    /api/tasks/dashboard   - Get dashboard stats
  GET    /api/tasks             - Get all tasks (filterable)
  POST   /api/tasks             - Create task
  GET    /api/tasks/:id         - Get single task
  PUT    /api/tasks/:id         - Update task
  DELETE /api/tasks/:id         - Delete task
  PATCH  /api/tasks/:id/status  - Update task status only

Users:
  GET    /api/users             - Get all users
  PATCH  /api/users/:id/role    - Update user role (Admin only)
  DELETE /api/users/:id         - Delete user (Admin only)

===============================================================================
SETUP & INSTALLATION
===============================================================================

Prerequisites:
  - Node.js >= 18.x
  - MongoDB Atlas account (or local MongoDB)
  - Git

Step 1: Clone the repository
  git clone <your-github-repo-url>
  cd team-task-manager

Step 2: Install dependencies
  npm install
  cd client && npm install && cd ..

Step 3: Configure environment variables
  Edit the .env file in the root directory:
    PORT=5000
    MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/team-task-manager
    JWT_SECRET=your_super_secret_key_here
    NODE_ENV=development

Step 4: Run in development mode
  npm run dev
  (This starts both backend on port 5000 and frontend on port 3000)

Step 5: Open browser
  Navigate to http://localhost:3000

===============================================================================
DEPLOYMENT ON RAILWAY
===============================================================================

Step 1: Create MongoDB Atlas Cluster
  - Go to https://cloud.mongodb.com
  - Create a free cluster
  - Create a database user
  - Whitelist all IPs (0.0.0.0/0)
  - Get the connection string

Step 2: Push to GitHub
  git init
  git add .
  git commit -m "Initial commit - TaskFlow Team Task Manager"
  git remote add origin <your-github-repo-url>
  git push -u origin main

Step 3: Deploy on Railway
  - Go to https://railway.app
  - Click "New Project" > "Deploy from GitHub Repo"
  - Select your repository
  - Add environment variables:
      MONGO_URI=<your-mongodb-atlas-uri>
      JWT_SECRET=<your-secret-key>
      NODE_ENV=production
  - Railway auto-detects Node.js
  - Build command: npm run build
  - Start command: npm start
  - Generate a domain under Settings

Step 4: Verify deployment
  - Open the generated Railway URL
  - Register an admin account
  - Create projects and tasks
  - Test all features

===============================================================================
DATABASE SCHEMA
===============================================================================

User Collection:
  - name: String (required)
  - email: String (required, unique)
  - password: String (hashed with bcrypt)
  - role: String (admin | member)
  - avatar: String
  - timestamps: createdAt, updatedAt

Project Collection:
  - name: String (required)
  - description: String (required)
  - owner: ObjectId -> User
  - members: [{ user: ObjectId -> User, role: String, joinedAt: Date }]
  - status: String (active | completed | archived)
  - deadline: Date
  - color: String (hex color)
  - timestamps: createdAt, updatedAt

Task Collection:
  - title: String (required)
  - description: String
  - project: ObjectId -> Project (required)
  - assignedTo: ObjectId -> User
  - createdBy: ObjectId -> User (required)
  - status: String (todo | in-progress | review | done)
  - priority: String (low | medium | high | critical)
  - dueDate: Date
  - tags: [String]
  - timestamps: createdAt, updatedAt

===============================================================================
AUTHOR
===============================================================================

Hardik Aggarwal

===============================================================================
