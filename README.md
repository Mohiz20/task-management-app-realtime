# Task Management App - Real-time

A modern, full-stack task management application with real-time updates, built with React and Node.js. Features a clean, responsive interface with dark/light theme sup*[Live demo links section left blank as requested - to be added when deployed]*

## 🔐 Authorization & Security

### Task Ownership, Permissions and real-time collaboration capabilities.

## 📱 Application Screenshots   

### ![1](https://drive.google.com/file/d/15xVSJXPcJv-kQAi8baWVzr0NQ05SNOQ3/view?usp=sharing)
### ![App Screenshot](https://drive.google.com/file/d/1xrMmFhiwdz7bnNQE7ZktjWmouPaN5PH7/view?usp=sharing)
### ![App Screenshot](https://drive.google.com/file/d/1KP93U64YydWaS1EE8YFHIPH5lj0ySapU/view?usp=sharing)
### ![App Screenshot](https://drive.google.com/file/d/1z-Xa1NlS1agYT3KoHcwB61XAmMQjeTeX/view?usp=sharing)

## 🌐 Live Demo

### ![App Demo](https://drive.google.com/file/d/1niM8utoCh5b5mhEZB3w4xKUFPLKDs_uX/view?usp=sharing)

## 🚀 Deployment

### Backend Deployment
- **AWS Ec2 behind cloudfront** -https://dice-reproduced-counted-replaced.trycloudflare.com/

### Frontend Deployment
- **Netlify** -https://task-omni.netlify.app/

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Real-time Updates**: Instant synchronization across multiple clients using Socket.IO
- **Task Organization**: Categorize tasks with colored tags
- **Task Filtering**: Filter by completion status (All, Pending, Completed)
- **Search Functionality**: Search tasks by title, description, or category
- **Task Sorting**: Sort by title or creation date (ascending/descending)
- **Task Completion Toggle**: Mark tasks as complete/incomplete with a single click

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Drag & Drop**: Intuitive task reordering (visual feedback included)
- **Toast Notifications**: Real-time feedback for all operations
- **Connection Status**: Visual indicator for real-time connection status
- **Form Validation**: Client-side validation for better user experience
- **Loading States**: Visual feedback during API operations
- **Empty States**: Helpful messaging when no tasks are available
- **Confirmation Modals**: Safety prompts for destructive actions

### Technical Features
- **Real-time Synchronization**: All task operations broadcast to connected clients
- **JWT Authentication**: Secure token-based authentication
- **API Documentation**: Comprehensive OpenAPI/Swagger documentation
- **Database Optimization**: Indexed queries for better performance
- **Error Handling**: Comprehensive error handling and user feedback
- **Environment Configuration**: Flexible deployment configuration

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **Prisma** - Next-generation ORM for database management
- **PostgreSQL** - Primary database
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Swagger UI Express** - API documentation
- **YAML.js** - YAML parser for OpenAPI specs

### Frontend
- **React 18** - UI library with modern hooks
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Styled Components** - CSS-in-JS styling solution
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time client communication
- **JWT Decode** - Token parsing and validation

### Development Tools
- **Nodemon** - Auto-restart development server
- **Prisma Studio** - Database GUI
- **ESLint** - Code linting (configured in Vite)

## 🏗️ Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-app-realtime
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/taskmanagement"
   DIRECT_URL="postgresql://username:password@localhost:5432/taskmanagement"
   
   # Server Configuration
   PORT=8080
   ORIGIN=http://localhost:5173
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   ```

5. **Start the backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_WITH_CREDENTIALS=true
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Environment Variables

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `DIRECT_URL` | Direct database connection (for migrations) | - | ✅ |
| `PORT` | Server port number | 8080 | ❌ |
| `ORIGIN` | Frontend URL for CORS | http://localhost:5173 | ❌ |
| `JWT_SECRET` | Secret key for JWT token signing | - | ✅ |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | - | ✅ |
| `VITE_WITH_CREDENTIALS` | Enable credentials in requests | false | ❌ |

## 📚 API Documentation

The API is fully documented using OpenAPI 3.0 specification. Once the backend server is running, you can access the interactive documentation at:

**Swagger UI**: `http://localhost:8080/docs`

### API Endpoints Overview

#### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

#### Task Management Endpoints
- `GET /api/tasks` - List all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion status

#### Health Check
- `GET /health` - Server health status

### Authentication
All task endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Real-time Events
The application uses Socket.IO for real-time updates with the following events:
- `task_created` - Broadcast when a new task is created
- `task_updated` - Broadcast when a task is updated
- `task_deleted` - Broadcast when a task is deleted

## � Authorization & Security

### Task Ownership and Permissions

The application implements a specific authorization model for task operations:

#### **Update Operations** 🔒 *Owner-Only Access*
- **Rule**: Only the user who created a task can update it
- **Implementation**: The update query includes both `id` and `userId` in the WHERE clause
- **Code Location**: `backend/services/taskService.js` - `updateTask` function
- **Database Query**: 
  ```javascript
  await prisma.task.update({
    where: { id, userId: req.user.id },  // Ownership verification
    data: { title, description, category, completed }
  });
  ```
- **Security Benefit**: Prevents unauthorized modification of tasks by other users
- **Error Handling**: If a user tries to update someone else's task, Prisma will throw a "Record not found" error

#### **Delete Operations** 🗑️ *Open Access*
- **Rule**: Any authenticated user can delete any task
- **Implementation**: The delete query only checks for task `id`, not `userId`
- **Code Location**: `backend/services/taskService.js` - `deleteTask` function
- **Database Query**:
  ```javascript
  await prisma.task.delete({ where: { id } });  // No ownership check
  ```
- **Use Case**: Allows collaborative task management where team members can clean up completed or outdated tasks

#### **Toggle Completion** ✅ *Open Access*
- **Rule**: Any authenticated user can mark any task as complete/incomplete
- **Implementation**: Similar to delete, only checks task `id`
- **Code Location**: `backend/services/taskService.js` - `toggleTask` function
- **Workflow**:
  1. Fetch current task state: `findUnique({ where: { id } })`
  2. Update with opposite completion status
  3. No ownership verification
- **Use Case**: Enables collaborative workflows where team members can mark tasks as done

#### **Read Operations** 👁️ *User-Scoped*
- **Rule**: Users can only see their own tasks
- **Implementation**: All list queries filter by `userId`
- **Database Query**:
  ```javascript
  await prisma.task.findMany({
    where: { userId: req.user.id },  // User-scoped filtering
    orderBy: { createdAt: 'desc' }
  });
  ```

### Authentication Flow

1. **JWT Token Verification** (`middleware/auth.js`):
   ```javascript
   const payload = jwt.verify(token, process.env.JWT_SECRET);
   req.user = { id: payload.id, email: payload.email };
   ```

2. **Request Authorization Header**:
   ```
   Authorization: Bearer <jwt-token>
   ```

3. **User Context**: All authenticated requests include `req.user` with user ID and email

### Real-time Authorization

- **Socket.IO Events**: Task updates are broadcast to ALL connected clients
- **Client-side Filtering**: Each client only displays tasks for the authenticated user
- **Event Types**:
  - `task_created` - Broadcast when any user creates a task
  - `task_updated` - Broadcast when any user updates/toggles a task
  - `task_deleted` - Broadcast when any user deletes a task

### Security Considerations

#### Current Implementation Strengths:
- ✅ Secure user authentication with JWT
- ✅ Password hashing with bcryptjs
- ✅ Owner-only task updates prevent unauthorized modifications
- ✅ User-scoped task listing ensures data privacy

#### Potential Security Enhancements:
- ⚠️ **Rate Limiting**: Implement rate limiting for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Abdul Mohiz**

---

*Built with ❤️ using React, Node.js, and Socket.IO*
