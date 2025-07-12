# StackIt - A Minimal Q&A Forum Platform

A full-stack Q&A forum platform built with React.js frontend and Node.js/Express backend, featuring user authentication, question/answer management, voting system, notifications, and admin panel.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based login/register system
- **Ask Questions**: Rich text editor with tags and formatting
- **Answer Questions**: Post answers with rich text support
- **Voting System**: Upvote/downvote questions and answers
- **Accept Answers**: Question owners can mark best answers
- **Tagging System**: Multi-select tags for categorization
- **Search & Filter**: Search questions and filter by tags/sort options
- **Notification System**: Real-time notifications for user activities

### User Roles
- **Guest**: View questions and answers
- **User**: Register, login, post questions/answers, vote
- **Admin**: Moderate content, ban users, send alerts, view reports

### Admin Features
- **Dashboard**: Platform statistics and recent activity
- **User Management**: View, ban/unban users
- **Content Moderation**: Approve/reject questions and answers
- **Platform Alerts**: Send notifications to all users
- **Moderation Queue**: Review pending content

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security headers
- **cors** for cross-origin requests
- **rate-limiting** for API protection

### Frontend
- **React.js** with hooks
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management
- **React Quill** for rich text editing
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **date-fns** for date formatting

## 📁 Project Structure

```
Stackit/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── questionController.js
│   │   ├── answerController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Answer.js
│   │   ├── Comment.js
│   │   ├── Notification.js
│   │   └── Tag.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── questions.js
│   │   ├── answers.js
│   │   ├── notifications.js
│   │   └── admin.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── NotificationDropdown.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AskQuestion.jsx
│   │   │   ├── QuestionDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Stackit/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/stackit
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Stackit/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/profile` - Update profile

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question
- `POST /api/questions/:id/accept-answer` - Accept answer

### Answers
- `GET /api/answers/question/:questionId` - Get answers for question
- `POST /api/answers/question/:questionId` - Create answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin (Admin only)
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `PUT /api/admin/questions/:id/moderate` - Moderate question
- `PUT /api/admin/answers/:id/moderate` - Moderate answer
- `POST /api/admin/alerts` - Send platform alert
- `GET /api/admin/moderation-queue` - Get moderation queue

## 🔧 Configuration

### Database
The application uses MongoDB. Make sure MongoDB is running locally or update the connection string in the environment variables.

### JWT Secret
Change the JWT_SECRET in production for security.

### CORS
Update the CORS origin in `server.js` for production deployment.

## 🎨 UI Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Rich Text Editor**: React Quill for question/answer content
- **Real-time Notifications**: Toast notifications for user feedback
- **Loading States**: Spinner components for better UX
- **Form Validation**: Client and server-side validation
- **Search & Filter**: Advanced filtering and search capabilities

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Express-validator for data validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for security
- **Helmet**: Security headers middleware
- **Admin Authorization**: Role-based access control

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Build the application: `npm run build`
3. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment
1. Update API base URL in production
2. Build the application: `npm run build`
3. Deploy to your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.

---

**StackIt** - Empowering developers to share knowledge and learn together! 🚀
