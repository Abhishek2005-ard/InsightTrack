# InsightTrack

InsightTrack is a self-hosted analytics tool that tracks page views, click coordinates, and session journeys, displaying them in a clean dashboard with interactive heatmaps.

It consists of three parts:
- **`tracker/`**: A lightweight tracking script you drop onto any webpage.
- **`backend/`**: A Node.js/Express API (MVC layout) backed by MongoDB.
- **`frontend/`**: A React dashboard to analyze sessions and heatmaps.

---

## Quick Start

### 1. Prerequisites
You need **Node.js** and a running **MongoDB** instance.

### 2. Configure & Run Backend
1. Go to the `backend/` folder.
2. Create a `.env` file (or set these environment variables in your Render Dashboard):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=some_random_secret_key
   ```
3. Install packages and start:
   ```bash
   npm install
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 3. Run Frontend Dashboard
1. Go to the `frontend/` folder.
2. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
   *(When deploying on **Vercel**, set the `VITE_API_URL` Environment Variable in the Vercel Dashboard to point to your live Render backend URL, e.g. `https://insighttrack-backend.onrender.com`)*
3. Install packages and start:
   ```bash
   npm install
   npm run dev
   ```
   The dashboard runs on `http://localhost:5173`. Default login is `alice@insighttrack.io` / `password123` (or create a new account via the Register tab).

---

## Setting up the Tracking Script

To track user events on your website:
1. Load the script asynchronously at the end of the `<body>`:
   ```html
   <script src="http://localhost:5000/tracker/tracker.js"></script>
   ```
2. The script auto-initializes, creates a unique visitor `session_id` in localStorage, and streams `page_view` and `click` coordinates back to the API.

---

## Project Structure

```
├── backend/
│   ├── controllers/      # Route logic (auth, telemetry, analytics)
│   ├── middleware/       # JWT auth & rate limiters
│   ├── models/           # Mongoose schemas (User, Session, Event)
│   ├── routes/           # Express router endpoints
│   └── server.js         # Express app config and entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/   # Dashboard, Heatmap, Sessions, Auth forms
│   │   └── App.jsx       # State management and root shell
├── tracker/
│   ├── tracker.js        # Event listener script
│   └── index.html        # Sandbox page for event generation
```
