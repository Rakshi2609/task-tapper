# Task Tapper

A modern, feature-rich collaborative task management platform with recurring tasks, communities, departments, real-time chat, and daily email summaries.

## 🌟 Overview

Task Tapper is a comprehensive task management solution designed for teams and communities. Built with a Node/Express + MongoDB backend and a modern React frontend, it provides:

- **One-Time & Recurring Tasks**: Create and manage both single and recurring tasks (Daily/Weekly/Monthly)
- **Community Structure**: Organize work into Communities → Departments → Tasks
- **Smart Task Management**: Auto-generate recurring tasks, skip Sundays, track completion
- **Real-Time Collaboration**: World chat via WebSockets with message persistence
- **Email Notifications**: Daily summary emails with de-duplication (Gmail + Nodemailer)
- **Rich Task Details**: Comments, updates, and priority tracking
- **User Stats**: Track assigned, completed, and pending tasks
- **Advanced Filtering**: Filter by status, type, date range with search capabilities
- **Mobile-First Design**: Responsive UI with compact layouts and pagination

## ✨ Key Features

### Task Management
- Create one-time or recurring tasks with customizable frequency
- Assign tasks to team members with priority levels (High/Medium/Low)
- Auto-generation of recurring task instances
- Smart date handling (automatically skip Sundays)
- Task completion tracking with history
- Comments and updates on tasks

### Community & Organization
- Multi-level structure: Communities → Departments → Tasks
- Department-based task organization
- Member management with pending approvals
- Owner and member role differentiation
- Community-wide visibility controls

### Filtering & Search
- **Status Filters**: All, Upcoming, Overdue, Completed
- **Type Filters**: All, One-Time, Recurring
- **Date Filters**: All Dates, Today, This Week, This Month
- **Search**: Real-time search across tasks, departments, and communities
- **Pagination**: Mobile-friendly pagination (6 items per page)

### Real-Time Features
- World chat with Socket.io
- Message persistence in MongoDB
- Last 50 messages on connect
- Live updates across connected clients

### User Experience
- Modern gradient designs with animations
- Compact, mobile-first layouts
- Framer Motion animations
- Responsive grid layouts (1-4 columns)
- Toast notifications for user feedback

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose
- **Real-Time**: Socket.io
- **Email**: Nodemailer with Gmail
- **Environment**: dotenv

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: React Icons
- **Date Picker**: React Datepicker

### Deployment
- **Frontend**: Vercel-ready with routing config
- **Backend**: Any Node.js hosting (Railway, Render, etc.)

## 📁 Project Structure

```
backend/
  ├── server.js                    # Express app + Socket.io + routes
  ├── taskScheduler.js             # Task scheduling logic
  ├── config/
  │   └── connectDB.js            # MongoDB connection with retry
  ├── controllers/
  │   ├── auth.js                 # Authentication logic
  │   ├── community.js            # Community management
  │   ├── team.js                 # Task operations
  │   └── recurringTaskController.js
  ├── models/
  │   ├── User.js                 # User schema
  │   ├── Community.js            # Community schema
  │   ├── CommunityDept.js        # Department schema
  │   ├── Team.js                 # One-time tasks
  │   ├── recurringTaskModel.js   # Recurring tasks
  │   ├── TaskUpdate.js           # Task updates/comments
  │   └── WorldChatMessage.js     # Chat messages
  ├── routes/
  │   ├── auth.route.js           # Auth endpoints
  │   ├── community.route.js      # Community endpoints
  │   ├── team.route.js           # Task endpoints
  │   └── recurringTaskRoutes.js  # Recurring task endpoints
  ├── socket/
  │   └── worldChat.js            # Socket.io chat setup
  └── utils/
      ├── checkAndSendDailySummary.js
      ├── emailTemplates.js
      └── sendMail.js

client/
  ├── src/
  │   ├── App.jsx                 # Main app component
  │   ├── components/
  │   │   ├── Dashboard.jsx
  │   │   ├── UserTasks.jsx       # Task list with filters
  │   │   ├── TaskDetail.jsx      # Single task view
  │   │   ├── RecurringTaskDetail.jsx
  │   │   ├── RecurringTaskForm.jsx
  │   │   ├── WorldChat.jsx       # Real-time chat
  │   │   └── community/
  │   │       ├── AllCommunity.jsx        # Communities list
  │   │       ├── CommunityMembers.jsx    # Member management
  │   │       ├── CommunityDepartment.jsx # Departments with filters
  │   │       ├── CommunityDeptTasks.jsx  # Department tasks
  │   │       ├── CreateCommunity.jsx
  │   │       ├── CreateCommunityDept.jsx
  │   │       ├── CreateCommunityTask.jsx
  │   │       └── CreateCommunityRecurringTask.jsx
  │   ├── services/
  │   │   ├── taskService.js
  │   │   ├── community.js
  │   │   └── recurring.js
  │   └── assests/
  │       └── store.js            # Zustand state
  ├── vite.config.js
  └── vercel.json                 # Vercel deployment config
```

## 📋 Prerequisites

- **Node.js** 18+ (recommended)
- **MongoDB** connection string (MongoDB Atlas or self-hosted)
- **Gmail Account** with App Password for email notifications

## ⚙️ Environment Variables 

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
# Required
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
EMAIL=your_gmail_address@gmail.com
APP_PASSWORD=your_gmail_app_password

# Optional
MONGO_DB_NAME=task_tapper          # If not in URI
MONGO_MAX_RETRIES=3
MONGO_RETRY_DELAY_MS=3000
PORT=5000                           # Default: 5000
TWILIO_SID=...                      # Optional for SMS
```

### Frontend Configuration

Create a `.env` file in the `client/` directory:

```env
VITE_APP_API_URL=http://localhost:5000
```

For production, update to your backend URL:
```env
VITE_APP_API_URL=https://your-api-domain.com
```

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd task-tapper
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to: **http://localhost:5173**

## 📡 API Documentation

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: Set via `VITE_APP_API_URL`

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/login` | User login | `{ email }` |
| POST | `/signup` | User registration | `{ email, username }` |
| POST | `/user-detail` | Update user details | `{ email, phoneNumber, role }` |
| GET | `/profile/:email` | Get user profile | - |
| GET | `/tasks/:email` | Get user's tasks | - |
| GET | `/assignedByMe` | Tasks assigned by user | `?email=user@example.com` |

### Tasks (`/api/function`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/createtask` | Create new task |
| POST | `/updatetask` | Mark task complete |
| POST | `/deletetask` | Delete task |
| GET | `/email` | Get all user emails |
| GET | `/tasks/:taskId` | Get single task |
| GET | `/tasks/:taskId/updates` | Get task updates |

**Create Task Body:**
```json
{
  "createdBy": "user@example.com",
  "taskName": "Task Title",
  "taskDescription": "Description",
  "assignedTo": "assignee@example.com",
  "assignedName": "Assignee Name",
  "dueDate": "2025-12-31",
  "priority": "High"
}
```

### Recurring Tasks (`/api/recurring-tasks`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all recurring tasks |
| POST | `/` | Create recurring task |
| GET | `/:id` | Get single recurring task |
| DELETE | `/:id` | Delete recurring task |
| POST | `/:taskId/updates` | Add task update |
| GET | `/:taskId/updates` | Get task updates |

**Create Recurring Task Body:**
```json
{
  "taskName": "Recurring Task",
  "taskDescription": "Description",
  "taskAssignedTo": "user@example.com",
  "taskFrequency": "Daily",
  "taskStartDate": "2025-01-01",
  "taskEndDate": "2025-12-31",
  "taskPriority": "Medium",
  "taskCreateDaysAhead": 1
}
```

### Communities (`/api/community`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all communities |
| POST | `/` | Create community |
| GET | `/:id` | Get community details |
| GET | `/:id/members` | Get community members |
| GET | `/:id/departments` | Get departments |
| POST | `/:id/departments` | Create department |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ping` | Trigger daily summary check |

### WebSocket Events (Socket.io)

#### Client → Server
- `world-chat-message`: Send chat message
  ```json
  { "userId": "user_id", "message": "Hello!" }
  ```

#### Server → Client
- `world-chat-init`: Initial 50 messages on connect
- `world-chat-message`: Broadcast new message to all clients

## 🎨 UI Features

### Modern Design
- Gradient backgrounds and text effects
- Smooth animations with Framer Motion
- Glass-morphism effects with backdrop blur
- Hover states and transitions
- Mobile-first responsive layouts

### Compact Views
- Reduced padding and margins for efficiency
- Smart text truncation with line-clamp
- Icon-only buttons on mobile
- Collapsible filter panels

### Advanced Filtering
- **Status**: All, Upcoming, Overdue, Completed
- **Task Type**: All, One-Time, Recurring  
- **Date Range**: All Dates, Today, This Week, This Month
- **Search**: Real-time search across all fields
- Filters work together and reset pagination

### Pagination
- 6 items per page (customizable)
- Numbered page buttons (max 5 visible)
- Previous/Next navigation
- Smart page number display
- Mobile-optimized controls

## 💡 Usage Examples

### Creating a Community

1. Navigate to Communities page
2. Click "Create Community"
3. Enter community name and description
4. Submit to create

### Adding a Department

1. Go to Community → Departments
2. Click "Create Department"
3. Fill in department details
4. Tasks can now be organized under this department

### Creating Tasks

**One-Time Task:**
- Go to Department → Add Task
- Fill in task details, assignee, due date, priority
- Submit to create

**Recurring Task:**
- Go to Department → Add Recurring
- Set frequency (Daily/Weekly/Monthly)
- Define start and end dates
- System auto-generates instances

### Filtering Tasks

1. Click the "Filter" button
2. Select desired filters:
   - Status (Upcoming, Overdue, etc.)
   - Task Type (One-Time or Recurring)
   - Date Range (Today, This Week, This Month)
3. Use search bar for specific tasks
4. Navigate through pages if needed

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Set environment variable:
   ```
   VITE_APP_API_URL=https://your-backend-url.com
   ```
4. Deploy

The `vercel.json` file handles routing for React Router.

### Backend (Railway/Render/Heroku)

1. Choose your hosting platform
2. Connect your repository
3. Set environment variables from `.env`
4. Deploy with Node.js 18+
5. Ensure MongoDB connection is accessible

### MongoDB Atlas Setup

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (0.0.0.0/0 for all IPs or specific IPs)
4. Get connection string and add to `MONGO_URI`

## 📜 Available Scripts

### Backend

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

### Frontend

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔧 Development Tips

### Git Configuration

First-time setup:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Hot Reload

- Backend uses nodemon for auto-restart on file changes
- Frontend uses Vite's HMR (Hot Module Replacement)

### Debugging

- Backend logs to console via `console.log()`
- Frontend uses React DevTools and browser console
- Socket.io has built-in debugging: set `DEBUG=socket.io*` in environment

### Database Queries

Monitor MongoDB operations:
```javascript
mongoose.set('debug', true);
```

## 🎯 Best Practices

### Task Creation
- Always set priority for better organization
- Use descriptive task names (50 chars max recommended)
- Add detailed descriptions for clarity
- Set realistic due dates

### Recurring Tasks
- Use "Daily" for everyday tasks
- Use "Weekly" for weekly meetings/reviews
- Use "Monthly" for monthly reports
- Set `taskCreateDaysAhead` to 1-2 for advance notice

### Community Management
- Create departments by function (Dev, Marketing, etc.)
- Assign department-specific tasks
- Keep community descriptions clear and concise
- Regularly review pending applications

### Performance
- Use pagination for large task lists
- Apply filters to narrow down results
- Search is case-insensitive and searches all fields
- Indexes on MongoDB collections for faster queries

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify environment variables are set
- Ensure port 5000 is available
- Check Node.js version (18+)

### Frontend can't connect to backend
- Verify `VITE_APP_API_URL` in client `.env`
- Check CORS settings in backend
- Ensure backend is running
- Check browser console for errors

### Tasks not appearing
- Verify user is logged in
- Check user email matches task assignment
- Confirm task is not filtered out
- Check MongoDB for data

### Email summaries not working
- Verify Gmail App Password (not regular password)
- Check EMAIL and APP_PASSWORD in `.env`
- Ensure "Less secure app access" is enabled (or use App Password)
- Check spam folder

### Socket.io not connecting
- Verify WebSocket support in browser
- Check firewall/proxy settings
- Ensure backend Socket.io is initialized
- Check browser console for connection errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is provided as-is. Add a proper license (MIT, Apache, etc.) if open-sourcing.

## 👥 Authors

- Built with ❤️ for efficient task management
- Contributions welcome!

## 🙏 Acknowledgments

- React team for amazing frontend framework
- MongoDB for flexible database solution
- Socket.io for real-time capabilities
- Vercel for seamless deployment
- All open-source contributors

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Made with 💙 by the Task Tapper Team**
