# Risuto

> A personal anime tracker built to organize, manage, and keep track of your anime journey.

Risuto is a full-stack web application where users can build their own anime library, track watching progress, organize titles by genre and priority, mark favorites, and view statistics about their collection.

The project was built with a focus on clean UI, practical authentication, and a complete frontend-to-backend workflow.

## Features

- User registration and login
- Email verification
- JWT-based authentication
- Forgot and reset password functionality
- Personal anime library
- Watch status tracking
- Priority management
- Genre filtering
- Search and sorting
- Favorite anime
- Anime notes
- Dashboard statistics
- Protected routes
- Responsive anime-inspired interface

## Tech Stack

### Frontend
- React.js
- React Router
- JavaScript
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Resend

### Deployment
- Render
- MongoDB Atlas

## How It Works

Users can create an account and build their own anime library. Each title can be assigned a watch status, priority, genres, notes, and favorite status.
The dashboard provides an overview of the collection, while the library offers searching, filtering, sorting, and detailed anime management.
Authentication and user-specific data are handled through a Node.js/Express backend with MongoDB, while the React frontend communicates with the backend through REST APIs.

## Project Structure

Risuto/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── css/
│   │   └── config/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── package.json
│
└── README.md
