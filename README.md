# Risuto

> A personal anime tracker built to organize, manage, and keep track of your anime journey.

Risuto is a full-stack web application where users can build their own anime library, track watching progress, organize titles by genre and priority, mark favorites, and view statistics about their collection.

The project was built with a focus on clean UI, practical authentication, and a complete frontend-to-backend workflow.

## Features

- User registration and login
- Email verification
- JWT-based authentication
- Forgot and reset password functionality (Not fully functional due to RESEND Free testing Limit)
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

## Email Verification Note

Risuto uses email verification to ensure that users have access to the email address they register with.

The current deployment uses Resend's testing sender, which limits email delivery to the verified testing address. Because of this limitation, verification emails cannot currently be delivered to arbitrary users.

For the current demo deployment, the verification token and generated verification URL are logged on the backend for development and administrative testing purposes. If a user does not receive the verification email, they can contact the administrator using their registered email address, and the account can be manually verified.

This is a temporary workaround for the demo deployment and is not intended as the final production email-verification system.

## NOTE regarding Usage

I made it personally for my use only. However, you are free to use and create account on it. As, i am using free tiers of deployment, Please do not send huge requests or misuse the app. I might delete your credentials if i see weird activity or increased usage. 

### Security Precautions

- Users remain unverified until the verification process is completed.
- Unverified accounts cannot log in.
- Verification tokens are randomly generated using Node.js `crypto`.
- Verification tokens are invalidated after successful verification.
- Verification URLs are not exposed through the frontend.
- Verification URLs are only available in protected backend logs during the current development/demo setup.
- A production deployment should use a properly authenticated email domain and deliver verification links directly to the user's registered email address.
  
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
