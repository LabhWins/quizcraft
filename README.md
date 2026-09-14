# QuizCraft

### AI-Powered Full-Stack Quiz Platform

QuizCraft is a full-stack online quiz application built with React and
Spring Boot. It supports AI-generated quizzes, JWT authentication, quiz
history, challenge mode, and real-time multiplayer gameplay.

## 🚀 Live Demo

**Frontend:** https://quizcraft-opal.vercel.app

**Backend:** https://quizcraft-backend-uds6.onrender.com

**GitHub:** https://github.com/LabhWins/quizcraft

**Ready Credentials:** Admin - admin1 
	 	 User1 - user1
		 User2 - newuser2

		 Password - test123

------------------------------------------------------------------------

## ✨ Features

-   User registration and login
-   JWT-based authentication
-   Category-based quizzes
-   AI-generated quiz questions using Gemini API
-   Quiz gameplay and score calculation
-   Quiz history
-   Question management
    -   Add questions
    -   Edit questions
    -   Delete questions
    -   View questions
-   Challenge mode
    -   Create a challenge from a completed quiz
    -   Share a challengeable link
    -   Guest users can join without logging in
    -   Compare challenge results
-   Real-time multiplayer
    -   Create multiplayer rooms
    -   Share room links
    -   Player join tracking
    -   Host gameplay
    -   Spectator mode
    -   Real-time WebSocket events
-   Responsive frontend
-   Production deployment with Vercel and Render

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React
-   Vite
-   React Router
-   Axios
-   STOMP
-   SockJS

### Backend

-   Java
-   Spring Boot
-   Spring Web
-   Spring Security
-   JWT
-   STOMP / WebSocket
-   REST APIs

### Database

-   PostgreSQL
-   Neon

### AI

-   Google Gemini API

### Deployment

-   Vercel --- Frontend
-   Render --- Backend
-   Neon --- PostgreSQL database

------------------------------------------------------------------------

## 🏗️ Architecture

``` text
                         USER
                           │
                           ▼
                  ┌─────────────────┐
                  │     Vercel      │
                  │                 │
                  │  React + Vite   │
                  │  React Router   │
                  └────────┬────────┘
                           │
                    REST / WebSocket
                           │
                           ▼
                  ┌─────────────────┐
                  │     Render      │
                  │                 │
                  │   Spring Boot   │
                  │    REST APIs    │
                  │      JWT        │
                  │ STOMP / SockJS  │
                  │    Challenge    │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │      Neon       │
                  │   PostgreSQL    │
                  └─────────────────┘

                           ▲
                           │
                    Gemini API
                           │
                    Spring Boot
```

------------------------------------------------------------------------

## 🎮 Application Flow

### Standard Quiz

``` text
Choose Category
      ↓
Create Quiz
      ↓
Load Questions
      ↓
Answer Questions
      ↓
Submit Quiz
      ↓
Calculate Result
      ↓
View Score
```

### Challenge Mode

A logged-in user can challenge another person using a shareable quiz
link.

``` text
Complete Quiz
      ↓
Create Challenge
      ↓
Generate Challenge Token
      ↓
Share Link
      ↓
Guest Opens Link
      ↓
Accept Challenge
      ↓
Play Quiz
      ↓
Submit Result
      ↓
Compare Results
```

Challenge links use the canonical production frontend URL.

### Multiplayer

``` text
Host Creates Room
      ↓
Select Category / Difficulty / Questions
      ↓
Generate Room Code
      ↓
Share Join Link
      ↓
Players Join
      ↓
WebSocket Connection
      ↓
Host Starts Game
      ↓
Real-Time Game Events
      ↓
Game Over
```

------------------------------------------------------------------------

## 🔐 Authentication

QuizCraft uses JWT-based authentication.

Authentication is required for protected user functionality such as:

-   Account registration and login
-   Quiz history
-   Creating challenges

Guest users can still access public functionality such as:

-   Playing quizzes
-   Joining challenges
-   Completing challenge quizzes
-   Joining multiplayer rooms

The application stores the JWT on the frontend and attaches it to
authenticated API requests.

------------------------------------------------------------------------

## 🤖 AI-Generated Quizzes

QuizCraft integrates the Gemini API through the Spring Boot backend.

The backend can use AI-generated questions as part of the quiz creation
flow while keeping the Gemini API key on the server side.

The frontend communicates only with the Spring Boot API and does not
directly expose the Gemini API key.

------------------------------------------------------------------------

## 🌐 Real-Time Multiplayer

Multiplayer functionality uses:

-   STOMP
-   SockJS
-   Spring WebSocket
-   React WebSocket integration

The backend exposes the WebSocket endpoint:

``` text
/ws
```

The application uses broker destinations such as:

``` text
/topic
/app
```

Real-time events include:

-   Player joined
-   Question started
-   Game over

------------------------------------------------------------------------

## 📡 API Overview

### Authentication

Authentication endpoints handle:

``` text
Register
Login
```

### Quiz

``` text
POST /quiz/create
GET  /quiz/get/{id}
POST /quiz/submit/{id}
GET  /quiz/my-history
GET  /quiz/history
GET  /quiz/attempt/{id}
```

### Questions

``` text
GET    /question/allQuestions
POST   /question/add
PUT    /question/update/{id}
DELETE /question/delete/{id}
```

### Challenge

``` text
POST /challenge/create
GET  /challenge/{token}
POST /challenge/{token}/complete
GET  /challenge/{token}/result
```

### WebSocket

``` text
/ws
```

------------------------------------------------------------------------

## 📁 Project Structure

``` text
quizcraft/
│
├── backend/
│   └── Spring Boot application
│
├── frontend/
│   └── React + Vite application
│
├── .gitignore
├── render.yaml
└── README.md
```

------------------------------------------------------------------------

## ⚙️ Environment Variables

### Frontend

Create a `.env` file inside `frontend/`:

``` env
VITE_API_URL=http://localhost:8080
VITE_APP_URL=http://localhost:5173
```

For production:

``` env
VITE_API_URL=https://quizcraft-backend-uds6.onrender.com
VITE_APP_URL=https://quizcraft-opal.vercel.app
```

### Backend

Configure the following environment variables:

``` env
NEON_DB_URL=
NEON_DB_USERNAME=
NEON_DB_PASSWORD=
JWT_SECRET=
GEMINI_API_KEY=
FRONTEND_URL=
```

**Never commit real credentials or API keys to GitHub.**

------------------------------------------------------------------------

## 💻 Local Development

### Prerequisites

Make sure the following are installed:

-   Java
-   Maven
-   Node.js
-   npm
-   PostgreSQL-compatible database or Neon account
-   Gemini API key

### 1. Clone the repository

``` bash
git clone https://github.com/LabhWins/quizcraft.git
cd quizcraft
```

### 2. Start the backend

``` bash
cd backend
mvn spring-boot:run
```

The backend runs on:

``` text
http://localhost:8080
```

### 3. Start the frontend

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

The frontend normally runs on:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## 🚀 Deployment

### Frontend

The frontend is deployed on Vercel.

Configuration:

``` text
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

### Backend

The Spring Boot backend is deployed on Render.

Production architecture:

``` text
Vercel
  ↓
React + Vite
  ↓
Render
  ↓
Spring Boot
  ↓
Neon PostgreSQL
```

------------------------------------------------------------------------

## 🔗 Production Links

  Resource            Link
  ------------------- ---------------------------------------------
  Live Application    https://quizcraft-opal.vercel.app
  Backend             https://quizcraft-backend-uds6.onrender.com
  GitHub Repository   https://github.com/LabhWins/quizcraft

------------------------------------------------------------------------

## 🔒 Security Notes

-   JWT is used for authenticated requests.
-   Production secrets are stored using environment variables.
-   `.env` files are excluded from Git.
-   The Gemini API key remains on the backend.
-   CORS is configured for the production frontend.
-   Challenge creation requires authentication.
-   Guest challenge participation does not require authentication.

------------------------------------------------------------------------

## 📌 Current Status

**QuizCraft is deployed and working in production.**

Completed functionality includes:

-   Authentication
-   Quiz gameplay
-   AI-generated questions
-   Question management
-   Quiz submission and results
-   Quiz history
-   Challenge mode
-   Guest challenge participation
-   Multiplayer room creation
-   Multiplayer joining
-   Real-time WebSocket functionality

------------------------------------------------------------------------

## 🔮 Future Improvements

Potential future improvements include:

-   More advanced rate limiting
-   Additional analytics and leaderboards
-   More multiplayer game modes
-   Enhanced quiz statistics
-   Improved accessibility
-   Automated testing and CI/CD improvements
-   Further performance optimization

------------------------------------------------------------------------

## 👨‍💻 Author

**Labhesh Kadu**

Full-Stack Developer \| Java \| Spring Boot \| React \| PostgreSQL

GitHub: https://github.com/LabhWins/quizcraft

------------------------------------------------------------------------

## ⭐ If you found QuizCraft interesting

Feel free to explore the live application and the source code.
