# Socially

<div align="center">

![Socially](https://img.shields.io/badge/Socially-Social%20Media%20App-blueviolet?style=for-the-badge)

A modern, full-stack social media application built with the MERN stack featuring real-time messaging, stories, and more.

[![React](https://img.shields.io/badge/React-17.0.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.4.1-010101?style=flat-square&logo=socket.io)](https://socket.io/)

[Live Demo](https://socially4u.vercel.app) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About

**Socially** is a feature-rich social media platform that enables users to connect, share moments, and communicate in real-time. Built with modern web technologies, it offers a seamless Instagram-like experience with posts, stories, direct messaging, and more.

---

## ✨ Features

### User Management
- **Authentication** - Secure signup, login, logout with JWT tokens
- **Password Recovery** - Forgot password and reset password via email
- **Profile Customization** - Update avatar, bio, website, and personal details
- **Follow System** - Follow/unfollow other users
- **Block Users** - Block/unblock functionality for user privacy

### Posts
- **Create Posts** - Share images with captions
- **Interactions** - Like, comment, and save posts
- **Post Management** - Edit captions and delete posts
- **Feed** - View posts from followed users
- **Explore** - Discover all posts from the community

### Stories
- **Create Stories** - Share temporary content (24-hour visibility)
- **Story Views** - See who viewed your stories
- **Story Reactions** - Like and interact with stories
- **Archive** - Archive stories for later
- **Highlights** - Save stories to profile highlights permanently

### Real-time Messaging
- **Direct Messages** - Private one-on-one conversations
- **Real-time Updates** - Instant message delivery with Socket.io
- **Media Sharing** - Send images in chats
- **Post Sharing** - Share posts directly in messages
- **Message Reactions** - React to messages with emojis
- **Message Management** - Edit, delete for me, delete for everyone
- **Read Receipts** - Know when messages are read
- **Search Messages** - Find messages within conversations

### Additional Features
- **Search Users** - Find users by name or username
- **Suggested Users** - Discover new people to follow
- **Responsive Design** - Optimized for all devices
- **Lazy Loading** - Performance-optimized component loading
- **Infinite Scroll** - Seamless content browsing

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 17 | UI Library |
| Redux | State Management |
| Redux Thunk | Async Actions |
| React Router v6 | Navigation |
| Material UI | UI Components |
| TailwindCSS | Styling |
| Socket.io Client | Real-time Communication |
| Axios | HTTP Requests |
| React Toastify | Notifications |
| Emoji Mart | Emoji Picker |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| Socket.io | WebSocket Server |
| JWT | Authentication |
| Bcrypt.js | Password Hashing |
| Cloudinary | Media Storage |
| Nodemailer | Email Service |
| Multer | File Uploads |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Hosting |
| MongoDB Atlas | Cloud Database |
| Cloudinary | Media CDN |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account (for email service)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/socially.git
   cd socially
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables** (see below)

5. **Run the development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm start
   ```

6. **Open the app**
   
   Navigate to `http://localhost:3000` in your browser

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (Gmail)
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

---

## 📁 Project Structure

```
socially/
├── backend/
│   ├── controllers/        # Request handlers
│   │   ├── chatController.js
│   │   ├── messageController.js
│   │   ├── postController.js
│   │   ├── storyController.js
│   │   └── userController.js
│   ├── middlewares/        # Custom middleware
│   │   ├── auth.js         # JWT authentication
│   │   ├── catchAsync.js   # Async error wrapper
│   │   ├── error.js        # Error handler
│   │   └── upload.js       # File upload config
│   ├── models/             # Mongoose schemas
│   │   ├── chatModel.js
│   │   ├── messageModel.js
│   │   ├── postModel.js
│   │   ├── storyModel.js
│   │   └── userModel.js
│   ├── routes/             # API routes
│   │   ├── chatRoute.js
│   │   ├── messageRoute.js
│   │   ├── postRoute.js
│   │   ├── storyRoute.js
│   │   └── userRoute.js
│   ├── utils/              # Utility functions
│   │   ├── connectDB.js
│   │   ├── errorHandler.js
│   │   ├── sendCookie.js
│   │   └── sendEmail.js
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
│
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── actions/        # Redux actions
│   │   ├── components/     # React components
│   │   │   ├── Chats/      # Messaging components
│   │   │   ├── Home/       # Home feed components
│   │   │   ├── Layouts/    # Layout components
│   │   │   ├── Navbar/     # Navigation components
│   │   │   ├── Stories/    # Story components
│   │   │   └── User/       # User profile components
│   │   ├── constants/      # Redux action types
│   │   ├── reducers/       # Redux reducers
│   │   ├── Routes/         # Route components
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Root component
│   │   ├── index.js        # Entry point
│   │   └── store.js        # Redux store
│   └── package.json
│
├── vercel.json             # Vercel deployment config
└── README.md
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/signup` | Register new user |
| POST | `/api/v1/login` | User login |
| GET | `/api/v1/logout` | User logout |
| POST | `/api/v1/password/forgot` | Request password reset |
| PUT | `/api/v1/password/reset/:token` | Reset password |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/me` | Get logged-in user details |
| DELETE | `/api/v1/me` | Delete account |
| GET | `/api/v1/user/:username` | Get user by username |
| PUT | `/api/v1/update/profile` | Update profile |
| PUT | `/api/v1/update/password` | Update password |
| GET | `/api/v1/follow/:id` | Follow/unfollow user |
| GET | `/api/v1/block/:id` | Block user |
| GET | `/api/v1/unblock/:id` | Unblock user |
| GET | `/api/v1/users` | Search users |
| GET | `/api/v1/users/suggested` | Get suggested users |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/post/new` | Create new post |
| GET | `/api/v1/posts` | Get feed posts |
| GET | `/api/v1/posts/all` | Get all posts |
| GET | `/api/v1/post/detail/:id` | Get post details |
| GET | `/api/v1/post/:id` | Like/unlike post |
| POST | `/api/v1/post/:id` | Save/unsave post |
| PUT | `/api/v1/post/:id` | Update caption |
| DELETE | `/api/v1/post/:id` | Delete post |
| POST | `/api/v1/post/comment/:id` | Add comment |

### Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/story/new` | Create new story |
| GET | `/api/v1/stories/feed` | Get stories feed |
| GET | `/api/v1/stories/user/:userId` | Get user stories |
| GET | `/api/v1/stories/archived` | Get archived stories |
| POST | `/api/v1/story/view/:storyId` | View story |
| POST | `/api/v1/story/like/:storyId` | Like/unlike story |
| POST | `/api/v1/story/archive/:storyId` | Archive story |
| DELETE | `/api/v1/story/:storyId` | Delete story |

### Highlights
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/highlight/new` | Create highlight |
| GET | `/api/v1/highlights/:userId` | Get user highlights |
| PUT | `/api/v1/highlight/:highlightId` | Update highlight |
| DELETE | `/api/v1/highlight/:highlightId` | Delete highlight |

### Chats & Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/newChat` | Create new chat |
| GET | `/api/v1/chats` | Get all chats |
| GET | `/api/v1/chats/unread` | Get unread count |
| DELETE | `/api/v1/chat/:chatId` | Delete chat |
| POST | `/api/v1/newMessage` | Send message |
| GET | `/api/v1/messages/:chatId` | Get messages |
| PUT | `/api/v1/messages/read/:chatId` | Mark as read |
| PUT | `/api/v1/message/edit` | Edit message |
| DELETE | `/api/v1/message/deleteForMe/:messageId` | Delete for me |
| DELETE | `/api/v1/message/deleteForEveryone/:messageId` | Delete for everyone |
| POST | `/api/v1/message/react` | Add reaction |
| DELETE | `/api/v1/message/react/:messageId` | Remove reaction |
| POST | `/api/v1/sharePost` | Share post in chat |

---

## 👤 Contact

**Pawan**

- GitHub: [@yourusername](https://github.com/yourusername)

---

<div align="center">

Made with ❤️ by Pawan

⭐ Star this repository if you found it helpful!

</div>
