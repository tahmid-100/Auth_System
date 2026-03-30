# Auth System

A comprehensive authentication and user profile management system built with **Node.js**, **Express.js**, and **MongoDB**. This project provides secure user authentication with JWT tokens, password hashing, OTP verification, and email/SMS notifications.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Technologies](#technologies)

## ✨ Features

- **User Authentication**: Register and login with secure password hashing using bcryptjs
- **JWT Token Management**: Generate and validate JWT tokens for session management
- **OTP Verification**: One-Time Password generation and validation for two-factor authentication
- **Email Notifications**: Send emails for account confirmations and password resets
- **SMS Notifications**: Send SMS messages for alerts and OTP delivery
- **User Profile Management**: Create, read, update user profile information
- **Input Validation**: Comprehensive input validation using Joi
- **CORS Support**: Cross-Origin Resource Sharing enabled for frontend integration
- **Static File Serving**: Serve frontend assets from the public directory
- **Environment Configuration**: Secure configuration management with dotenv

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                          │
│                    (HTML/CSS/JavaScript)                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Express.js App    │
                    │   (Port 5000)       │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
    ┌────────────┐        ┌─────────────┐       ┌───────────┐
    │   Routes   │        │ Middleware  │       │ Controllers
    │            │        │             │       │
    │ /api/auth  │        │ • auth.js   │       │ • authCtrl
    │ /api/user  │        │ • validation│       │ • profileCtrl
    └────────────┘        └─────────────┘       └───────────┘
        │                                            │
        └────────────────────┬─────────────────────┘
                             │
        ┌────────────────────┼─────────────────────┐
        │                    │                     │
        ▼                    ▼                     ▼
    ┌─────────┐         ┌──────────┐        ┌───────────┐
    │  Models │         │  Utils   │        │ Config    │
    │         │         │          │        │           │
    │ User.js │         │ • email  │        │database.js│
    │         │         │ • otp    │        │           │
    │         │         │ • sms    │        │           │
    │         │         │ • token  │        │           │
    └────┬────┘         └──────────┘        └─────┬─────┘
         │                   │                     │
         └───────────────────┼─────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   MongoDB       │
                    │   Database      │
                    └─────────────────┘
```

## 📁 Project Structure

```
Auth/
├── app.js                          # Main Express application entry point
├── package.json                    # Project dependencies and scripts
├── config/
│   └── database.js                # MongoDB connection configuration
├── controllers/
│   ├── authController.js          # Authentication logic (login, register)
│   └── profileController.js       # User profile operations
├── middleware/
│   ├── auth.js                    # JWT authentication middleware
│   └── validation.js              # Input validation middleware using Joi
├── models/
│   └── User.js                    # MongoDB User schema and model
├── routes/
│   ├── auth.js                    # Authentication routes
│   └── profile.js                 # Profile management routes
├── utils/
│   ├── emailService.js            # Email sending service
│   ├── otpGenerator.js            # OTP generation and validation
│   ├── smsService.js              # SMS sending service
│   └── tokenGenerator.js          # JWT token generation and validation
├── public/
│   └── index.html                 # Frontend HTML file
└── README.md                       # This file
```

## 📦 Installation

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

### Steps

1. **Clone the repository**
   ```bash
   cd Auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/auth_db
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password
   SMS_API_KEY=your_sms_api_key
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will run on `http://localhost:5000`

## ⚙️ Configuration

### Database Configuration (`config/database.js`)
Handles MongoDB connection setup using Mongoose. Requires `MONGODB_URI` in environment variables.

### Environment Variables
Create a `.env` file with the following variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiration time (e.g., "7d") |
| `SMTP_HOST` | Email service SMTP host |
| `SMTP_PORT` | Email service port |
| `SMTP_USER` | Email sender address |
| `SMTP_PASS` | Email password/app token |
| `SMS_API_KEY` | SMS service API key |

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login user and receive JWT token |
| `POST` | `/api/auth/verify-otp` | Verify OTP for two-factor authentication |
| `POST` | `/api/auth/refresh-token` | Refresh existing JWT token |

### Profile Routes (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile` | Get current user profile |
| `PUT` | `/api/profile` | Update user profile |
| `DELETE` | `/api/profile` | Delete user account |

## 💻 Usage

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Get User Profile (Requires JWT Token)
```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ Technologies

### Backend Framework
- **Express.js** - Fast, unopinionated web framework for Node.js
- **Node.js** - JavaScript runtime environment

### Database
- **MongoDB** - NoSQL document database
- **Mongoose** - MongoDB object modeling for Node.js

### Security
- **bcryptjs** - Password hashing library
- **jsonwebtoken** - JWT token creation and verification
- **cors** - Cross-Origin Resource Sharing middleware

### Validation & Utility
- **Joi** - Schema validation library
- **dotenv** - Environment variable management
- **nodemon** - Development tool for auto-restarting the server

## 📝 Notes

- All passwords are hashed using bcryptjs before storage
- JWT tokens are used for stateless authentication
- Email and SMS services require proper API credentials
- CORS is enabled to allow frontend-backend communication
- The frontend is served from the `public` directory
- All API routes are prefixed with `/api`

## 🚀 Development

For development with auto-reload functionality:
```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

## 📄 License

ISC

---

**Note**: This is a template authentication system. For production deployment, ensure proper security measures, environment variable handling, and database-level security configurations.
