# 🧠 NeuroHealth

> Your intelligent health companion powered by AI. Track calories, monitor nutrition, and achieve your wellness goals with personalized insights.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791.svg)](https://www.postgresql.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Development](#development)

## 🎯 Overview

NeuroHealth is a comprehensive health and wellness application designed to help users track their nutritional intake, monitor progress, and receive AI-powered insights. Built for the EnergizED Hackathon, this application combines modern web technologies with artificial intelligence to provide a seamless health tracking experience.

## ✨ Features

- **🔐 User Authentication** - Secure JWT-based authentication system
- **📊 Calorie Tracking** - Log meals and track daily caloric intake
- **🤖 AI-Powered Analysis** - Get detailed calorie estimates and nutrition insights using Google Gemini AI
- **📈 Progress Monitoring** - Track BMI, weight, and health goals over time
- **💬 AI Health Coach** - Interactive conversations with an AI assistant for personalized health advice
- **🎯 Goal Setting** - Set and track personalized health and fitness goals
- **📱 Responsive Design** - Modern, user-friendly interface that works on all devices

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### AI & Services
- **Google Gemini AI** - Calorie estimation and nutrition analysis
- **Dataset Integration** - Reference nutrition datasets for accurate estimates

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Client-side functionality

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v13 or higher) or access to a PostgreSQL database (e.g., [Neon DB](https://neon.tech/))
- **Google Gemini API Key** - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NeuroHealth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   PORT=3000
   JWT_SECRET=your_secure_random_string
   CALORIES_TRACKING_GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Set up the database**
   ```bash
   npm run migration:dev
   ```

   This will:
   - Create the database schema
   - Run all migrations
   - Seed the database (if seed data is configured)

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/neurohealth` |
| `PORT` | Server port number | `3000` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-key-here` |
| `CALORIES_TRACKING_GEMINI_API_KEY` | Google Gemini API key | `AIza...` |

### Database Setup

1. **Development Environment**
   - Create a `.env.development` file
   - Set `PORT=3000`
   - Add your development database connection string

2. **Test Environment** (Optional)
   - Create a `.env.test` file
   - Set `PORT=3001`
   - Add your test database connection string

### Getting API Keys

- **Google Gemini API Key**: 
  1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Sign in with your Google account
  3. Create a new API key
  4. Copy the key to your `.env` file

- **PostgreSQL Database**:
  - Option 1: Install PostgreSQL locally
  - Option 2: Use a cloud service like [Neon DB](https://neon.tech/) (free tier available)

## 💻 Usage

### Starting the Server

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

### Accessing the Application

Once the server is running, open your browser and navigate to:
```
http://localhost:3000
```

### Available Pages

- **Landing Page**: `http://localhost:3000/`
- **Authentication**: `http://localhost:3000/html/auth.html`
- **Dashboard**: `http://localhost:3000/html/dashboard.html`
- **Calorie Tracker**: `http://localhost:3000/html/calorie-tracker.html`

## 📁 Project Structure

```
NeuroHealth/
├── prisma/
│   ├── migrations/          # Database migrations
│   ├── schema.prisma        # Prisma schema definition
│   └── seed.js              # Database seeding script
├── src/
│   ├── models/              # Data models
│   │   ├── Calorie.model.js
│   │   ├── User.model.js
│   │   └── prismaClient.js
│   ├── routers/             # API route handlers
│   │   ├── Auth.router.js
│   │   ├── Calorie.router.js
│   │   └── Users.router.js
│   ├── services/            # Business logic services
│   │   ├── calories.gemini.service.js
│   │   ├── dataset-loader.service.js
│   │   └── datasets/        # Nutrition datasets
│   ├── public/              # Static files
│   │   ├── html/            # HTML pages
│   │   ├── js/              # Client-side JavaScript
│   │   ├── styles/          # CSS stylesheets
│   │   └── middleware/      # Middleware functions
│   ├── app.js               # Express app configuration
│   └── server.js            # Server entry point
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Users
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

### Calories
- `POST /api/calorie/generate` - Generate calorie estimate (public)
- `POST /api/calorie` - Create calorie entry (authenticated)
- `GET /api/calorie/user` - Get user's calorie entries (authenticated)
- `GET /api/calorie/date?date=YYYY-MM-DD` - Get calories by date (authenticated)
- `PUT /api/calorie/:id` - Update calorie entry (authenticated)
- `DELETE /api/calorie/:id` - Delete calorie entry (authenticated)

## 🧪 Development

### Database Migrations

```bash
# Create a new migration
npm run migration:dev

# Reset database (WARNING: This will delete all data)
npm run migration:reset
```

## 🤝 Contributing

This project was created for the EnergizED Hackathon. Contributions and improvements are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is part of the EnergizED Hackathon submission.

## 🙏 Acknowledgments

- Built for the EnergizED Hackathon
- Powered by Google Gemini AI
- Nutrition datasets for accurate calorie tracking

---

**Made with ❤️ for better health and wellness**
