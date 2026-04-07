# 🚀 Smart Task & Notes Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing tasks with secure authentication, real-time filtering, dark mode, and cloud deployment.

---

## 📁 Project Structure

```
smart-tasks/
├── backend/                  # Node.js + Express API
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, GetMe
│   │   └── taskController.js   # CRUD + Search/Filter
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── errorMiddleware.js  # Global error handler + asyncHandler
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt hashed password)
│   │   └── Task.js             # Task schema (status, priority, dueDate, tags)
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth/*
│   │   └── taskRoutes.js       # /api/tasks/* (protected)
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express app entry point
│
└── frontend/                 # React SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── PrivateRoute.js   # Route guard
    │   │   ├── TaskCard.js       # Task display card
    │   │   └── TaskModal.js      # Create/Edit modal
    │   ├── context/
    │   │   └── AuthContext.js    # Global auth state (Context API)
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   └── DashboardPage.js  # Main app UI
    │   ├── api.js                # Axios instance + API methods
    │   ├── App.js                # Router + route definitions
    │   ├── index.js              # React entry point
    │   └── styles.css            # Full design system + dark mode
    ├── .env.example
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier is fine)
- npm or yarn

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-tasks-mern.git
cd smart-tasks-mern
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/smarttasks
JWT_SECRET=your_long_random_secret_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

API will be live at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

App will be live at: `http://localhost:3000`

---

## 🔌 API Reference

### Auth Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login & get JWT | No |
| GET | `/api/auth/me` | Get current user | Yes |

**Register body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Login/Register response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

### Task Endpoints (All Protected — Bearer Token Required)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | Get all user tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| DELETE | `/api/tasks/clear` | Delete all completed tasks |

**Query Parameters for GET /api/tasks:**
- `search` — full-text search on title/description
- `status` — `pending` | `in-progress` | `completed`
- `priority` — `low` | `medium` | `high`
- `sortBy` — `createdAt` | `dueDate` | `priority` | `title`
- `order` — `asc` | `desc`

**Task body:**
```json
{
  "title": "Build MERN project",
  "description": "Complete all modules",
  "status": "pending",
  "priority": "high",
  "dueDate": "2024-12-31",
  "tags": ["project", "mern"]
}
```

**Authorization Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## 🎨 Features

### Core Features
- ✅ User registration & login with JWT
- ✅ Password hashing with bcrypt
- ✅ Protected routes (frontend & backend)
- ✅ Full CRUD for tasks
- ✅ Global auth state via Context API
- ✅ Axios interceptors for token injection
- ✅ Error handling middleware

### Bonus Features
- ✅ Search tasks by title/description
- ✅ Filter by status and priority
- ✅ Sort by date, priority, title
- ✅ Dark mode (persisted to localStorage)
- ✅ Due dates with overdue warning
- ✅ Task tags
- ✅ Task stats dashboard (completion progress bar)
- ✅ Responsive design (mobile-first)
- ✅ Clear all completed tasks

---

## ☁️ Deployment

### Backend → Render

1. Push backend folder to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables:
   - `MONGO_URI` — your MongoDB Atlas URI
   - `JWT_SECRET` — long random string
   - `NODE_ENV` — `production`
   - `FRONTEND_URL` — your Netlify/Vercel URL

### Frontend → Vercel

1. Push frontend folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repo
4. Set environment variable:
   - `REACT_APP_API_URL` — your Render backend URL + `/api`
5. Deploy!

### MongoDB Atlas Setup
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user (username + password)
3. Whitelist IP: `0.0.0.0/0` (allow all — for cloud deploy)
4. Get connection string → paste into `MONGO_URI`

---

## 🧪 Testing with Postman

1. Import the collection or manually test:
2. **Register:** `POST http://localhost:5000/api/auth/register`
3. **Login:** `POST http://localhost:5000/api/auth/login` → copy the `token`
4. For task routes, set Header: `Authorization: Bearer <token>`
5. **Create Task:** `POST http://localhost:5000/api/tasks`
6. **Get Tasks:** `GET http://localhost:5000/api/tasks?status=pending`
7. **Update Task:** `PUT http://localhost:5000/api/tasks/<task_id>`
8. **Delete Task:** `DELETE http://localhost:5000/api/tasks/<task_id>`

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Styling | Pure CSS (custom design system, dark mode) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📄 License
MIT — free to use for educational purposes.
