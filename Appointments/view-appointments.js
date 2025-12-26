(function manageSession() {
    const userJson = localStorage.getItem('currentUser');
    const profileContainer = document.getElementById('user-profile');
    const nameDisplay = document.getElementById('user-display-name');

    if (!userJson) {
        // Redirect to login if trying to access pages without auth
        if (!window.location.href.includes('auth.html')) {
            window.location.href = 'auth.html';
        }
        return;
    }

    const user = JSON.parse(userJson);

    // Update the UI with Name or Guest ID
    if (nameDisplay) {
        if (user.isGuest) {
            nameDisplay.innerText = `Guest: ${user.id}`;
        } else {
            nameDisplay.innerText = user.name;
        }
    }
})();

// Logout function
function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    }
}

(function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'auth.html'; // Redirect to login if not authenticated
    }
})();


let currentTab = 'Pending';

function switchTab(status) {
    currentTab = status;
    // UI Update
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === status);
    });
    renderAppointments();
}

function renderAppointments() {
    const grid = document.getElementById('appointments-grid');
    const msg = document.getElementById('no-data-msg');
    const bookings = JSON.parse(localStorage.getItem('confirmedBookings')) || {};
    
    // 1. Identify the Current User
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    // 2. FILTER: Only show what the user is allowed to see
    const filteredKeys = Object.keys(bookings).filter(key => {
        const entry = bookings[key];
        const statusMatch = (entry.status || 'Pending') === currentTab;
        
        // ADMIN sees all matching the tab status
        if (user.role === 'admin') return statusMatch;
        
        // USER sees only if the status matches AND they own the record
        return statusMatch && entry.userId === user.id;
    });

    if (filteredKeys.length === 0) {
        msg.style.display = 'block';
        grid.innerHTML = '';
        return;
    }

    msg.style.display = 'none';
    grid.innerHTML = '';

    filteredKeys.sort().reverse().forEach(key => {
        const entry = bookings[key];
        const card = document.createElement('div');
        card.className = 'appointment-card';
        
        // ... (Date Formatting logic stays same) ...
        const parts = key.split('-');
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const dateStr = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', month: 'short', day: 'numeric' 
        });
        const startIdx = Math.min(...entry.slots);
        const endIdx = Math.max(...entry.slots);

        // 3. ADMIN-ONLY ACTIONS: Define buttons only if user.role is 'admin'
        let adminActions = '';
        if (user.role === 'admin') {
            if (currentTab === 'Pending') {
                adminActions = `<button class="btn-confirm" onclick="updateStatus('${key}', 'Confirmed')">Confirm</button>`;
            } else if (currentTab === 'Confirmed') {
                adminActions = `<button class="btn-complete" onclick="updateStatus('${key}', 'Completed')">Complete</button>`;
            }
        }

        // 4. DELETE Logic: Admin can delete anything, Users usually can't (or only their own)
        const deleteButton = (user.role === 'admin') 
            ? `<button class="btn-delete" onclick="deleteBooking('${key}')">Delete</button>` 
            : '';

        // 5. STATUS TAG: Shown for Users since they can't click buttons
        const statusTag = (currentTab === 'Completed') ? `<div class="completed-tag">✔️ Finished</div>` : `<div class="status-label">${currentTab}</div>`;

        card.innerHTML = `
            <div class="card-header">
                <span>${dateStr}</span>
                <span>${formatTime(startIdx)} - ${formatTime(endIdx + 1)}</span>
            </div>
            <div class="card-body">
                <h3>${entry.clientName}</h3>
                <p class="client-info">📧 ${entry.clientEmail} | 📞 ${entry.clientPhone}</p>
                <p class="client-desc">"${entry.clientDesc || 'No project notes.'}"</p>
                ${user.role === 'admin' ? `<p class="owner-id">User ID: ${entry.userId}</p>` : ''}
            </div>
            <div class="card-footer">
                ${user.role === 'admin' ? adminActions : statusTag}
                ${deleteButton}
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateStatus(key, newStatus) {
    const bookings = JSON.parse(localStorage.getItem('confirmedBookings'));
    if (bookings[key]) {
        bookings[key].status = newStatus;
        localStorage.setItem('confirmedBookings', JSON.stringify(bookings));
        renderAppointments();
    }
}

function formatTime(index) {
    const h = Math.floor(index / 2) + 5;
    const m = (index % 2) === 0 ? "00" : "30";
    return `${h.toString().padStart(2, '0')}:${m}`;
}

function deleteBooking(key) {
    if (confirm("Permanently delete this record?")) {
        const bookings = JSON.parse(localStorage.getItem('confirmedBookings'));
        delete bookings[key];
        localStorage.setItem('confirmedBookings', JSON.stringify(bookings));
        renderAppointments();
    }
}

// Initial Load

document.addEventListener('DOMContentLoaded', renderAppointments);
