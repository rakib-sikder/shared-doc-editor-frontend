# Real-Time Collaborative Document Editor

A simplified, real-time collaborative document editor built as a Minimum Viable Product (MVP). This application allows users to create, edit, and share text documents, with changes reflected instantly for all collaborators, similar to Google Docs.

---

## Live Demo

- **Frontend (Vercel):** [Link to your deployed frontend]
- **Backend (Render):** [Link to your deployed backend]

---

## Features

- **User Authentication:** Secure user signup and login using JWT.
- **Document Management:**
  - Create, read, and delete documents.
  - Rich text editing capabilities using Quill.js.
  - Auto-saving document content and title.
- **Real-Time Collaboration:**
  - Live text updates broadcasted to all users in the same document room using Socket.IO.
- **Sharing & Permissions:**
  - Document owners can share documents with other users via email.
  - Basic role management (editor/viewer).
- **User Presence:**
  - View the avatars of users who are currently online in a document.

---

## Tech Stack

| Category    | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Next.js, React, Tailwind CSS      |
| Backend     | Node.js, Express.js               |
| Database    | MongoDB Atlas with Mongoose       |
| Real-Time   | Socket.IO                         |
| Auth        | JSON Web Tokens (JWT), bcrypt.js  |

---

## Project Structure

```
├── backend/
│   ├── index.js        # Main server file with all logic
│   ├── package.json
│   └── .env.example    # Example environment variables
│
├── frontend/
│   ├── pages/
│   │   ├── index.js        # Login Page
│   │   ├── signup.js       # Signup Page
│   │   ├── dashboard.js    # User's document dashboard
│   │   └── doc/
│   │       └── [id].js     # The document editor page
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Local Setup and Installation

To run this project on your local machine, follow these steps.

### Prerequisites

- Node.js (v14 or later)
- npm
- A MongoDB Atlas account

### 1. Clone the Repository

```sh
git clone <your-repository-url>
cd <your-repository-folder>
```

### 2. Backend Setup

Navigate to the backend directory:

```sh
cd backend
```

Install dependencies:

```sh
npm install
```

Create your environment file:  
Create a new file named `.env` in the backend folder. Copy the contents from `.env.example` (if you have one) or use the template below.

**backend/.env**
```
# Your MongoDB Atlas connection string. Replace <user>, <password>, and <cluster-url>.
MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/DocEditorDB?retryWrites=true&w=majority

# A long, random, and secret string for signing JWT tokens
JWT_SECRET=THIS_IS_A_VERY_SECRET_KEY_FOR_JWT

# The port the backend server will run on
PORT=5000
```

Run the backend server:

```sh
node index.js
```

The server should now be running on [http://localhost:5000](http://localhost:5000).

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```sh
cd frontend
```

Install dependencies:

```sh
npm install
```

Run the frontend development server:

```sh
npm run dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

All API routes are prefixed with `/api`.

| Method | Endpoint                | Description                                 | Protected | Request Body                        |
|--------|-------------------------|---------------------------------------------|-----------|-------------------------------------|
| POST   | /auth/signup            | Register a new user                         | No        | `{ fullName, email, password }`     |
| POST   | /auth/login             | Log in a user and get a JWT                 | No        | `{ email, password }`               |
| POST   | /documents              | Create a new document                       | Yes       | `{ title }` (optional)              |
| GET    | /documents              | Get all docs owned by/shared with user      | Yes       | -                                   |
| GET    | /documents/:id          | Get a single document by its ID             | Yes       | -                                   |
| PUT    | /documents/:id          | Update a document's title or content        | Yes       | `{ title, content }` (optional)     |
| DELETE | /documents/:id          | Delete a document                           | Yes       | -                                   |
| POST   | /documents/:id/share    | Share a document with another user          | Yes       | `{ email, role }`                   |

---

## Deployment

- **Backend:** Deployed on Render. The server is configured to use the `PORT` environment variable provided by Render. Environment variables (`MONGO_URI`, `JWT_SECRET`) must be set in the Render dashboard.
- **Frontend:** Deployed on Vercel. The frontend code must be updated to point to the live Render backend URL for all API and Socket.IO calls before deploying.