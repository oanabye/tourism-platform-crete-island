// ==============================
// Pac-Man Beach App Backend
// Node.js + Express + SQLite + JWT
// ==============================

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const db = new sqlite3.Database("./db.sqlite");
const JWT_SECRET = 'secret_key';

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// ==============================
// Helper Function: Haversine Formula
// ==============================
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
              Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

// ==============================
// Authentication Routes
// ==============================
app.post("/register", async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            "INSERT INTO Users (email, password, role) VALUES (?, ?, ?)",
            [email, hashedPassword, role || 'user'],
            (err) => {
                if (err) return res.status(400).json({ message: 'Email already used or DB error' });
                res.status(201).json({ message: 'User registered successfully!' });
            }
        );
    } catch (e) { res.status(500).send(); }
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM Users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user.id, role: user.role });
    });
});

app.get('/profile', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send();

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send();
        db.get("SELECT id, email, role FROM Users WHERE id = ?", [decoded.userId], (err, user) => {
            if (user) res.json(user);
            else res.status(404).send();
        });
    });
});

// ==============================
// Beaches Routes
// ==============================
app.post("/closest-beaches", (req, res) => {
    const { lat, lon } = req.body;
    db.all("SELECT * FROM Plaje", [], (err, rows) => {
        if(err) return res.status(500).send();

        let beaches = rows.map(b => {
            const dist = haversine(lat, lon, b.latitudine, b.longitudine);
            return {
                ...b,
                distance: dist.toFixed(2),
                time: ((dist / 5) * 60).toFixed(0), // travel time estimate
                imagine: b.imagine || 'https://via.placeholder.com/300x150',
                descriere: b.descriere || 'A beautiful beach.'
            };
        });
        res.json(beaches.sort((a,b) => a.distance - b.distance).slice(0,5));
    });
});

// ==============================
// Favorites Routes
// ==============================
app.post("/toggle-favorite", (req, res) => {
    const { userId, beachId } = req.body;
    db.get("SELECT id FROM Favorite WHERE user_id = ? AND beach_id = ?", [userId, beachId], (err, row) => {
        if (row) {
            db.run("DELETE FROM Favorite WHERE id = ?", [row.id], () =>
                res.json({ action: "removed", message: "Removed from favorites!" })
            );
        } else {
            db.run("INSERT INTO Favorite (user_id, beach_id) VALUES (?, ?)", [userId, beachId], () =>
                res.json({ action: "added", message: "Added to favorites!" })
            );
        }
    });
});

app.get("/favorites/:userId", (req, res) => {
    const query = `SELECT Plaje.* FROM Plaje JOIN Favorite ON Plaje.id = Favorite.beach_id WHERE Favorite.user_id = ?`;
    db.all(query, [req.params.userId], (err, rows) => {
        if (err) return res.status(500).send();
        res.json(rows.map(b => ({ ...b, descriere: b.descriere || 'Saved beach.' })));
    });
});

// ==============================
// Reviews Routes
// ==============================
app.post("/add-review", (req, res) => {
    const { userId, beachId, comentariu, nota } = req.body;
    db.run(
        "INSERT INTO Recenzii (user_id, beach_id, comentariu, nota) VALUES (?, ?, ?, ?)",
        [userId, beachId, comentariu, nota],
        () => res.json({ success: true })
    );
});

app.get("/reviews/:beachId", (req, res) => {
    const query = `SELECT Recenzii.*, Users.email
                   FROM Recenzii JOIN Users ON Recenzii.user_id = Users.id
                   WHERE beach_id = ?
                   ORDER BY data_postare DESC`;
    db.all(query, [req.params.beachId], (err, rows) => res.json(rows));
});

// ==============================
// Admin Routes
// ==============================
app.get("/admin/users", (req, res) => {
    db.all("SELECT id, email, role FROM Users", [], (err, rows) => res.json(rows));
});

app.delete("/admin/users/:id", (req, res) => {
    db.get("SELECT role FROM Users WHERE id = ?", [req.params.id], (err, user) => {
        if (user?.role === 'admin') return res.status(403).json({ message: "Cannot delete an admin" });
        db.run("DELETE FROM Users WHERE id = ?", [req.params.id], () => res.json({ message: "Deleted" }));
    });
});

app.get("/admin/beaches", (req, res) => {
    db.all("SELECT id, nume FROM Plaje ORDER BY nume ASC", [], (err, rows) => res.json(rows));
});

app.post("/admin/add-beach", (req, res) => {
    const { nume, latitudine, longitudine, imagine, descriere } = req.body;
    db.run(
        "INSERT INTO Plaje (nume, latitudine, longitudine, imagine, descriere) VALUES (?, ?, ?, ?, ?)",
        [nume, latitudine, longitudine, imagine, descriere],
        () => res.json({ success: true })
    );
});

app.delete("/admin/beaches/:id", (req, res) => {
    db.run("DELETE FROM Plaje WHERE id = ?", [req.params.id], () => res.json({ message: "Deleted" }));
});

// ==============================
// Start Server
// ==============================
app.listen(3000, () => console.log("Server running on http://localhost:3000"));