# tourism-platform-crete-island

A full-stack web application for exploring beaches in Crete, built with a Node.js backend and a vanilla JavaScript frontend. Developed as a personal project to practice full-stack development, REST API design, and interactive map integration.

The platform allows users to discover nearby beaches, save favorites, leave reviews, and manage content through an admin panel.

---

## 🧠 Overview

The goal of this project was to build a fully functional tourism web platform where users can interact with a real map, find beaches closest to their location, and manage their own profile — all backed by a custom REST API and a local SQLite database.

The application handles authentication, role-based access control, and real-time map interactions entirely from scratch, without using any frontend framework.

---

## ⚙️ Features

### User-Facing
- **Interactive Map** — Leaflet.js map with satellite and street view modes
- **Closest Beach Finder** — click anywhere on the map to find the nearest beaches
- **Walking & Driving Routes** — real-time route calculation via OpenRouteService API
- **Favorites System** — save and revisit favorite beaches
- **Reviews & Ratings** — leave star ratings and comments on beaches
- **User Authentication** — register, log in, and manage session securely

### Admin Panel
- View and delete registered users
- Add and remove beaches from the database
- Role-based access: admin features are only visible to admin accounts

---

## 🛠️ Technologies & Concepts

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Maps:** Leaflet.js, OpenStreetMap, Google Satellite tiles
- **Routing:** OpenRouteService API
- **Auth:** Token-based session authentication
- **Concepts:** REST API design, role-based access control, async/await, DOM manipulation

---

## 🚀 Getting Started

### Prerequisites

```bash
node --version   # Node.js required
npm --version
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oanabye/tourism-platform-crete-island.git
   cd tourism-platform-crete-island
   ```

2. Install backend dependencies:
   ```bash
   cd src/backend
   npm install
   ```

3. Start the backend server:
   ```bash
   node app.js
   ```

4. Open the frontend:
   ```bash
   # Open src/frontend/index.html in your browser
   # Or use Live Server in VS Code
   ```

The app will be running at `http://localhost:3000`.

---

## 📁 Project Structure

```
tourism-platform-crete-island/
├── src/
│   ├── backend/
│   │   ├── app.js              # Express server & all API routes
│   │   ├── db.sqlite           # Local SQLite database
│   │   ├── package.json
│   │   └── node_modules/
│   └── frontend/
│       ├── index.html          # Main page structure
│       ├── main.js             # All client-side logic
│       └── style.css           # Styling
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📌 What I Built

- Full REST API with Express (login, register, favorites, reviews, admin routes)
- Token-based authentication stored in `sessionStorage`
- Interactive map with click-to-search functionality
- Real-time walking and driving route rendering using an external API
- Admin panel with user and beach management
- Role-based UI rendering (admin button only visible to admin accounts)

---

## 💡 What I Learned

Working on this project gave me hands-on experience with:

- How to design and structure a REST API from scratch
- Managing user sessions securely with tokens on the client side
- Integrating third-party APIs (maps, routing) into a real project
- Handling async operations and error states cleanly in vanilla JS
- Thinking about **role-based access control** and what it means in practice

---

## 🎓 Academic & Personal Context

| | |
|---|---|
| **Type** | Personal / CV Project |
| **Year** | 3rd year, Bachelor's degree |
| **University** | Technical University |
| **Purpose** | Full-stack practice — REST API, maps, authentication, admin panel |

---

## 👩‍💻 Author

**Oana** — [GitHub Profile](https://github.com/oanabye)