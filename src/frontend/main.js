// ==========================================
// 1. SESSION MANAGEMENT & LOGOUT
// ==========================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = window.location.pathname;
    };
}

// ==========================================
// 2. FORM TOGGLE LOGIC (LOGIN / REGISTER)
// ==========================================
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const authSection = document.getElementById('auth-section');
const registerSection = document.getElementById('register-section');

if (showRegister) {
    showRegister.onclick = (e) => {
        e.preventDefault();
        if (authSection) authSection.style.display = 'none';
        if (registerSection) registerSection.style.display = 'block';
    };
}

if (showLogin) {
    showLogin.onclick = (e) => {
        e.preventDefault();
        if (registerSection) registerSection.style.display = 'none';
        if (authSection) authSection.style.display = 'block';
    };
}

// ==========================================
// 3. AUTHENTICATION (LOGIN & REGISTER)
// ==========================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('userId', data.userId);
                location.reload();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Login failed. Please try again.');
        }
    };
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const res = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                alert('Account created! You can now log in.');
                showLogin.click();
            } else {
                const data = await res.json();
                alert(data.message || 'Registration failed.');
            }
        } catch (err) {
            alert('Connection error. Please try again.');
        }
    };
}

// ==========================================
// 4. FAVORITES MODAL
// ==========================================
const profileBtn = document.getElementById('profile-btn');
const modal = document.getElementById('favorites-modal');
const closeBtn = document.querySelector('.close-modal');

if (profileBtn) {
    profileBtn.onclick = async () => {
        const token = sessionStorage.getItem('authToken');
        const emailSpan = document.getElementById('current-user-email');

        modal.style.display = 'block';
        loadFavorites();

        if (token && emailSpan) {
            try {
                const res = await fetch('http://localhost:3000/profile', {
                    method: 'GET',
                    headers: { 'Authorization': token }
                });

                if (res.ok) {
                    const data = await res.json();
                    emailSpan.innerText = data.email;
                } else {
                    emailSpan.innerText = 'Failed to load profile';
                }
            } catch (err) {
                console.error('Profile error:', err);
                emailSpan.innerText = 'Connection error';
            }
        }
    };
}

if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => { if (event.target === modal) modal.style.display = 'none'; };

async function loadFavorites() {
    const userId = sessionStorage.getItem('userId');
    const favList = document.getElementById('favorites-list');
    if (!userId || !favList) return;

    try {
        const res = await fetch(`http://localhost:3000/favorites/${userId}`);
        const favs = await res.json();
        favList.innerHTML = '';

        if (favs.length === 0) {
            favList.innerHTML = "<li style='padding:10px;'>No favorite beaches yet.</li>";
            return;
        }

        favs.forEach(b => {
            const li = document.createElement('li');
            li.style = 'display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; align-items:center;';
            li.innerHTML = `
                <strong>${b.nume}</strong>
                <button onclick='window.zoomToBeach(${JSON.stringify(b)})'
                        style="padding:5px 10px; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;">
                    View
                </button>
            `;
            favList.appendChild(li);
        });
    } catch (err) {
        console.error('Error loading favorites:', err);
    }
}

// ==========================================
// 5. SAVE / TOGGLE FAVORITES
// ==========================================
window.saveToFav = async (event, beachId) => {
    event.stopPropagation();
    const userId = sessionStorage.getItem('userId');
    const heartIcon = event.target;

    if (!userId || userId === 'undefined') {
        alert('Please log in to save favorites.');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/toggle-favorite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, beachId })
        });
        const data = await res.json();

        if (res.ok) {
            const isFavorited = data.action === 'added';
            heartIcon.classList.toggle('fav-active', isFavorited);
            heartIcon.style.color = isFavorited ? '#ff4757' : '#ccc';
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Network error:', err);
    }
};

// ==========================================
// 6. REVIEWS MODAL
// ==========================================
window.openReviews = async (beachId, beachName) => {
    document.getElementById('review-beach-id').value = beachId;
    document.getElementById('review-beach-name').innerText = 'Reviews: ' + beachName;
    document.getElementById('reviews-modal').style.display = 'block';
    loadReviews(beachId);
};

async function loadReviews(beachId) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = 'Loading...';

    try {
        const res = await fetch(`http://localhost:3000/reviews/${beachId}`);
        const reviews = await res.json();

        container.innerHTML = reviews.length === 0 ? '<p>No reviews yet.</p>' : '';

        reviews.forEach(r => {
            const div = document.createElement('div');
            div.style = 'padding:10px; border-bottom:1px solid #eee; font-size:0.9rem;';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <strong>${r.email.split('@')[0]}</strong>
                    <span>${'⭐'.repeat(r.nota)}</span>
                </div>
                <p style="margin:5px 0;">${r.comentariu}</p>
                <small style="color:gray;">${new Date(r.data_postare).toLocaleDateString()}</small>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error('Error loading reviews:', err);
    }
}

document.getElementById('review-form').onsubmit = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem('userId');
    const beachId = document.getElementById('review-beach-id').value;
    const nota = document.getElementById('review-rating').value;
    const comentariu = document.getElementById('review-text').value;

    const res = await fetch('http://localhost:3000/add-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, beachId, comentariu, nota })
    });

    if (res.ok) {
        document.getElementById('review-text').value = '';
        loadReviews(beachId);
    }
};

document.querySelector('.close-reviews').onclick = () => {
    document.getElementById('reviews-modal').style.display = 'none';
};

// ==========================================
// 7. MAP INITIALIZATION
// ==========================================
let map;

function initMap() {
    // Define map layers
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });

    const satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Maps'
    });

    // Initialize map centered on Crete with satellite as default
    map = L.map('map', {
        center: [35.2401, 24.8093],
        zoom: 9,
        layers: [satellite]
    });

    L.control.layers({ 'Street Map': osm, 'Satellite': satellite }).addTo(map);
    setTimeout(() => map.invalidateSize(), 300);

    // Show user's current location as a blue dot (without moving the map)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude, longitude } }) => {
                L.circleMarker([latitude, longitude], {
                    radius: 8,
                    fillColor: '#007bff',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map).bindPopup('Your current location');
            },
            () => console.warn('GPS location denied or unavailable.')
        );
    }

    // Track temporary markers and route lines
    let selectedMarker = null;
    let beachMarkers = [];
    let polylines = [];

    // On map click: find and display the closest beaches
    map.on('click', async (e) => {
        const { lat, lng } = e.latlng;

        if (selectedMarker) map.removeLayer(selectedMarker);
        selectedMarker = L.marker([lat, lng]).addTo(map).bindPopup('Selected point').openPopup();

        beachMarkers.forEach(m => map.removeLayer(m));
        polylines.forEach(l => map.removeLayer(l));
        beachMarkers = [];
        polylines = [];

        try {
            const res = await fetch('http://localhost:3000/closest-beaches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon: lng })
            });
            const beaches = await res.json();

            const list = document.getElementById('beach-list');
            const resultsPanel = document.getElementById('results-panel');

            // Animate results panel
            resultsPanel.style.display = 'block';
            resultsPanel.classList.remove('results-animation');
            void resultsPanel.offsetWidth;
            resultsPanel.classList.add('results-animation');

            list.innerHTML = '';

            for (const b of beaches) {
                const walking = await getRoute(lat, lng, b.latitudine, b.longitudine, 'foot-walking');
                const driving = await getRoute(lat, lng, b.latitudine, b.longitudine, 'driving-car');

                const marker = L.marker([b.latitudine, b.longitudine])
                    .addTo(map)
                    .bindPopup(`<strong>${b.nume}</strong>`);
                beachMarkers.push(marker);

                const item = document.createElement('li');
                item.className = 'beach-card';
                item.innerHTML = `
                    <img src="${b.imagine || 'https://via.placeholder.com/150'}" class="beach-img">
                    <div class="beach-info">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong>${b.nume}</strong>
                            <div>
                                <i class="fas fa-comment-dots"
                                   onclick="event.stopPropagation(); window.openReviews(${b.id}, '${b.nume}')"
                                   style="margin-right:10px; cursor:pointer; color:var(--primary);"></i>
                                <i class="fas fa-heart fav-icon" onclick="window.saveToFav(event, ${b.id})"></i>
                            </div>
                        </div>
                        <p style="font-size:0.85rem; color:#555; margin:5px 0; line-height:1.2;">
                            ${b.descriere || 'A beautiful beach in Crete.'}
                        </p>
                        <small>
                            <i class="fas fa-walking"></i> ${Math.round(walking.time)} min &nbsp;|&nbsp;
                            <i class="fas fa-car"></i> ${Math.round(driving.time)} min
                        </small>
                    </div>
                `;

                // On card click: draw walking route on map
                item.onclick = (ev) => {
                    if (ev.target.classList.contains('fa-heart')) return;
                    polylines.forEach(l => map.removeLayer(l));
                    const line = L.polyline(walking.coords, { color: '#007bff', weight: 6 }).addTo(map);
                    polylines.push(line);
                    map.fitBounds(line.getBounds(), { padding: [50, 50] });
                    marker.openPopup();
                };

                list.appendChild(item);
            }
        } catch (err) {
            console.error('Error fetching closest beaches:', err);
        }
    });
}

// ==========================================
// 8. HELPER FUNCTIONS
// ==========================================

// Zoom to a beach from the favorites list
window.zoomToBeach = (beach) => {
    const modal = document.getElementById('favorites-modal');
    if (modal) modal.style.display = 'none';

    map.setView([beach.latitudine, beach.longitudine], 15);

    const list = document.getElementById('beach-list');
    const resultsPanel = document.getElementById('results-panel');

    resultsPanel.style.display = 'block';
    list.innerHTML = '';

    const item = document.createElement('li');
    item.className = 'beach-card';
    item.innerHTML = `
        <img src="${beach.imagine || 'https://via.placeholder.com/150'}" class="beach-img">
        <div class="beach-info">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${beach.nume}</strong>
                <div>
                    <i class="fas fa-comment-dots"
                       onclick="event.stopPropagation(); window.openReviews(${beach.id}, '${beach.nume}')"
                       style="margin-right:10px; cursor:pointer; color:var(--primary);"></i>
                    <i class="fas fa-heart fav-icon" onclick="window.saveToFav(event, ${beach.id})"></i>
                </div>
            </div>
            <p style="font-size:0.85rem; color:#555; margin:5px 0; line-height:1.2;">
                ${beach.descriere || 'A beautiful beach in Crete.'}
            </p>
            <small>Viewed from favorites</small>
        </div>
    `;

    L.marker([beach.latitudine, beach.longitudine])
        .addTo(map)
        .bindPopup(`<strong>${beach.nume}</strong>`)
        .openPopup();

    list.appendChild(item);
};

// Fetch a route from OpenRouteService and return coords + duration
async function getRoute(lat1, lon1, lat2, lon2, profile) {
    const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQxNjYyNjE4MTljYzQyODg4OGZlODE2ZGM2NTk5MTVhIiwiaCI6Im11cm11cjY0In0=';
    const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}&start=${lon1},${lat1}&end=${lon2},${lat2}`;

    const res = await fetch(url);
    const data = await res.json();

    return {
        coords: data.features[0].geometry.coordinates.map(c => [c[1], c[0]]),
        time: data.features[0].properties.summary.duration / 60
    };
}

// ==========================================
// 9. APP INITIALIZATION
// ==========================================
window.onload = () => {
    const token = sessionStorage.getItem('authToken');

    const authContainer = document.getElementById('auth-container');
    const mapWrapper = document.getElementById('map-wrapper');
    const logoutBtn = document.getElementById('logout-btn');

    if (token) {
        // User is logged in — show the map
        if (authContainer) authContainer.style.display = 'none';
        if (mapWrapper) mapWrapper.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
        initMap();
        checkAdminStatus();
    } else {
        // User is not logged in — show auth forms
        if (authContainer) authContainer.style.display = 'block';
        if (mapWrapper) mapWrapper.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
};

// ==========================================
// 10. ADMIN PANEL
// ==========================================
async function checkAdminStatus() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    try {
        const res = await fetch('http://localhost:3000/profile', {
            headers: { 'Authorization': token }
        });
        const user = await res.json();

        if (user.role === 'admin') {
            // Inject admin button into the page
            const btn = document.createElement('button');
            btn.innerText = '⚙️ Admin';
            btn.style = 'position:fixed; bottom:20px; left:20px; z-index:1000; padding:10px; cursor:pointer;';
            btn.onclick = () => {
                document.getElementById('admin-modal').style.display = 'block';
                loadAdminUsers();
            };
            document.body.appendChild(btn);
        }
    } catch (err) {
        console.error('Admin check failed:', err);
    }
}

async function loadAdminUsers() {
    const list = document.getElementById('admin-users-list');
    if (!list) return;

    try {
        const res = await fetch('http://localhost:3000/admin/users');
        const users = await res.json();
        list.innerHTML = '';

        users.forEach(u => {
            const isAdmin = u.role === 'admin';
            const li = document.createElement('li');
            li.style = 'display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; align-items:center; background:white; margin-bottom:5px; border-radius:5px;';
            li.innerHTML = `
                <span>
                    <strong>${u.email}</strong>
                    <span style="color:${isAdmin ? '#e67e22' : '#7f8c8d'}; font-size:0.8rem;">
                        [${u.role.toUpperCase()}]
                    </span>
                </span>
                ${!isAdmin
                    ? `<button onclick="deleteUser(${u.id})"
                               style="background:#ff4757; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                           <i class="fas fa-trash"></i> Delete
                       </button>`
                    : `<span style="font-style:italic; font-size:0.8rem; color:#95a5a6;">Protected</span>`
                }
            `;
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Error loading users:', err);
    }
}

window.deleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
        await fetch(`http://localhost:3000/admin/users/${id}`, { method: 'DELETE' });
        loadAdminUsers();
    }
};

document.getElementById('admin-add-beach-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        nume: document.getElementById('admin-beach-name').value,
        latitudine: document.getElementById('admin-beach-lat').value,
        longitudine: document.getElementById('admin-beach-lng').value,
        imagine: document.getElementById('admin-beach-img').value,
        descriere: document.getElementById('admin-beach-desc').value
    };

    const res = await fetch('http://localhost:3000/admin/add-beach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert('Beach added successfully!');
        location.reload();
    }
};

async function loadAdminBeaches() {
    const list = document.getElementById('admin-beaches-list');
    if (!list) return;

    try {
        const res = await fetch('http://localhost:3000/admin/beaches');
        const beaches = await res.json();
        list.innerHTML = '';

        beaches.forEach(b => {
            const li = document.createElement('li');
            li.style = 'display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; align-items:center; background:#fff; margin-bottom:5px; border-radius:5px;';
            li.innerHTML = `
                <span>${b.nume}</span>
                <button onclick="deleteBeach(${b.id})"
                        style="background:#ff4757; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Error loading beaches:', err);
    }
}

window.deleteBeach = async (id) => {
    if (confirm('Are you sure you want to delete this beach? This action is irreversible!')) {
        try {
            const res = await fetch(`http://localhost:3000/admin/beaches/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Beach deleted successfully.');
                loadAdminBeaches();
            }
        } catch (err) {
            alert('Error deleting beach.');
        }
    }
};

// Switch between admin panel sections
window.showAdminSection = (sectionId) => {
    document.querySelectorAll('.admin-tab-content').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'users-section') loadAdminUsers();
    if (sectionId === 'beaches-section') loadAdminBeaches();
};