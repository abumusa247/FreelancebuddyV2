
(function manageSession() {
    const userJson = localStorage.getItem('currentUser');
    const nameDisplay = document.getElementById('user-display-name');

    if (!userJson) {
        // If no user is logged in, send them to the login page
        // Note: adjust the path below if auth.html is in a different folder
        window.location.href = '../SignIn/auth.html';
        return;
    }

    const user = JSON.parse(userJson);

    // Display Name or Guest ID in the navbar
    if (nameDisplay) {
        nameDisplay.innerText = user.isGuest ? `Guest: ${user.id}` : user.name;
    }
})();

function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('currentUser');
        window.location.href = '../SignIn/auth.html';
    }
}

(function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'auth.html'; // Redirect to login if not authenticated
    }
})();

/* --- Configuration & State --- */
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let currentWeekStart = new Date();
let selection = { dayKey: null, startIdx: null, endIdx: null };
let bookedSlots = JSON.parse(localStorage.getItem('confirmedBookings')) || {};

const hours = [];
for (let h = 5; h <= 22; h++) {
    hours.push(`${h.toString().padStart(2, '0')}:00`, `${h.toString().padStart(2, '0')}:30`);
}

/* --- Helper: Force Local Date String (Fixes the Day-1 Bug) --- */
function formatDayKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/* --- Initialization --- */
function init() {
    setMonday(new Date()); 
    renderAll();

    document.getElementById('prevWeek').onclick = () => changeWeek(-7);
    document.getElementById('nextWeek').onclick = () => changeWeek(7);
    document.getElementById('todayBtn').onclick = () => {
        setMonday(new Date());
        renderAll();
    };

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) bookingForm.onsubmit = handleFormSubmit;
}

function setMonday(date) {
    const tempDate = new Date(date);
    const day = tempDate.getDay();
    const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
    currentWeekStart = new Date(tempDate.setDate(diff));
    currentWeekStart.setHours(0, 0, 0, 0);
}

function changeWeek(days) {
    currentWeekStart.setDate(currentWeekStart.getDate() + days);
    renderAll();
}

/* --- Rendering --- */
function renderAll() {
    renderHeaders();
    renderGrid();
    renderUI(); 
}

function renderHeaders() {
    const hDays = document.getElementById('header-days');
    const hDates = document.getElementById('header-dates');
    
    hDays.innerHTML = '<th>Time</th>' + dayNames.map(d => `<th>${d}</th>`).join('');
    
    let dateHtml = '<th>Date</th>';
    for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        dateHtml += `<th>${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</th>`;
    }
    hDates.innerHTML = dateHtml;
}

function renderGrid() {
    const body = document.getElementById('grid-body');
    body.innerHTML = '';

    hours.forEach((time, rowIdx) => {
        let row = `<tr><td class="time-label">${time}</td>`;
        for (let i = 0; i < 7; i++) {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            const dayKey = formatDayKey(d); // Use our helper here
            
            let isBooked = false;
            const dayData = bookedSlots[dayKey];
            if (dayData) {
                if (dayData.slots && dayData.slots.includes(rowIdx)) isBooked = true;
                else if (Array.isArray(dayData) && dayData.includes(rowIdx)) isBooked = true;
            }
            
            const bookedClass = isBooked ? 'booked' : '';
            // We ensure data-daykey is exactly what was generated for this column
            row += `<td class="slot ${bookedClass}" data-daykey="${dayKey}" data-row="${rowIdx}"></td>`;
        }
        body.innerHTML += row + '</tr>';
    });

    document.querySelectorAll('.slot:not(.booked)').forEach(slot => {
        slot.onclick = handleSelect;
    });
}

function handleSelect(e) {
    // This targets the specific cell clicked
    const dayKey = e.target.getAttribute('data-daykey');
    const rowIdx = parseInt(e.target.getAttribute('data-row'));

    if (selection.dayKey !== dayKey) {
        selection = { dayKey, startIdx: rowIdx, endIdx: rowIdx };
    } else {
        if (rowIdx < selection.startIdx) selection.startIdx = rowIdx;
        else selection.endIdx = rowIdx;
    }
    renderUI();
}

function renderUI() {
    document.querySelectorAll('.slot:not(.booked)').forEach(slot => {
        const sKey = slot.getAttribute('data-daykey');
        const sRow = parseInt(slot.getAttribute('data-row'));
        slot.classList.toggle('selected', 
            sKey === selection.dayKey && 
            sRow >= selection.startIdx && 
            sRow <= selection.endIdx
        );
    });

    const summaryBody = document.getElementById('summary-body');
    const btn = document.getElementById('send-request');
    const formInputs = document.querySelectorAll('#booking-form input, #booking-form textarea');
    
    if (selection.dayKey && summaryBody) {
        // Fix: Parse the key safely for display
        const parts = selection.dayKey.split('-');
        const displayDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const dateStr = displayDate.toLocaleDateString('en-US', { 
            weekday: 'short', month: 'short', day: 'numeric' 
        });

        const duration = (selection.endIdx - selection.startIdx + 1) * 0.5;

        summaryBody.innerHTML = `
            <tr>
                <td>${dateStr}</td>
                <td>${hours[selection.startIdx]}</td>
                <td>${hours[selection.endIdx + 1] || '23:00'}</td>
                <td>${duration} Hr(s)</td>
            </tr>`;
        
        btn.disabled = false;
        btn.classList.add('active');
        formInputs.forEach(input => input.disabled = false);
    } else if (summaryBody) {
        summaryBody.innerHTML = `<tr><td colspan="4">No selection made</td></tr>`;
        btn.disabled = true;
        btn.classList.remove('active');
        formInputs.forEach(input => input.disabled = true);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    if (!selection.dayKey) return;

    const newBooking = {
        slots: [],
        clientName: document.getElementById('client-name').value,
        clientPhone: document.getElementById('client-phone').value,
        clientEmail: document.getElementById('client-email').value,
        clientDesc: document.getElementById('client-desc').value,
        status: 'Pending',
        timestamp: new Date().toISOString()
    };

    for (let i = selection.startIdx; i <= selection.endIdx; i++) {
        newBooking.slots.push(i);
    }

    bookedSlots[selection.dayKey] = newBooking;
    localStorage.setItem('confirmedBookings', JSON.stringify(bookedSlots));
    
    selection = { dayKey: null, startIdx: null, endIdx: null };
    e.target.reset();
    renderAll();
    alert("Appointment saved successfully!");
}

init();