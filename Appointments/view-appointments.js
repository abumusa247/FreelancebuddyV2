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
    
    // Filter keys based on the active tab
    const filteredKeys = Object.keys(bookings).filter(key => {
        const status = bookings[key].status || 'Pending';
        return status === currentTab;
    });

    if (filteredKeys.length === 0) {
        msg.style.display = 'block';
        grid.innerHTML = '';
        return;
    }

    msg.style.display = 'none';
    grid.innerHTML = '';

    // Sort Newest to Oldest
    filteredKeys.sort().reverse().forEach(key => {
        const entry = bookings[key];
        const card = document.createElement('div');
        card.className = 'appointment-card';
        
        // Date Formatting
        const parts = key.split('-');
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const dateStr = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', month: 'short', day: 'numeric' 
        });

        const startIdx = Math.min(...entry.slots);
        const endIdx = Math.max(...entry.slots);

        // Define Action Button based on Tab
        let actionButton = '';
        if (currentTab === 'Pending') {
            actionButton = `<button class="btn-confirm" onclick="updateStatus('${key}', 'Confirmed')">Confirm</button>`;
        } else if (currentTab === 'Confirmed') {
            actionButton = `<button class="btn-complete" onclick="updateStatus('${key}', 'Completed')">Complete</button>`;
        } else {
            actionButton = `<div class="completed-tag">✔️ Finished</div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <span>${dateStr}</span>
                <span>${formatTime(startIdx)} - ${formatTime(endIdx + 1)}</span>
            </div>
            <div class="card-body">
                <h3>${entry.clientName}</h3>
                <p class="client-info">📧 ${entry.clientEmail} | 📞 ${entry.clientPhone}</p>
                <p class="client-desc">"${entry.clientDesc || 'No project notes.'}"</p>
            </div>
            <div class="card-footer">
                ${actionButton}
                <button class="btn-delete" onclick="deleteBooking('${key}')">Delete</button>
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