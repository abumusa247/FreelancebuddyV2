let isLoginMode = true;

const authForm = document.getElementById('auth-form');
const toggleBtn = document.getElementById('toggle-auth');
const nameGroup = document.getElementById('name-group');
const authTitle = document.getElementById('auth-title');
const submitBtn = document.getElementById('submit-btn');
const toggleText = document.getElementById('toggle-text');

// Example: Setting an admin during login
const userSession = {
    id: "U123",
    name: "Admin User",
    role: "admin" // or "customer"
};
localStorage.setItem('currentUser', JSON.stringify(userSession));

// Example Sign-In Function
function handleLogin(email, password) {
    // ... your validation logic ...
    const user = {
        id: email, // Use email as the unique ID
        name: email.split('@')[0], // Use part of email as a temporary name
        role: 'user',
        isGuest: false
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Example Guest Function
function handleGuestLogin() {
    const guestId = "Guest_" + Math.floor(Math.random() * 10000);
    const user = {
        id: guestId, // Use the generated string as the unique ID
        name: "Guest User",
        role: 'user',
        isGuest: true
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Switch between Login and Register
toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    authTitle.innerText = isLoginMode ? 'Welcome Back' : 'Create Account';
    submitBtn.innerText = isLoginMode ? 'Sign In' : 'Register';
    nameGroup.style.display = isLoginMode ? 'none' : 'flex';
    toggleText.innerHTML = isLoginMode 
        ? 'Don\'t have an account? <a href="#" id="toggle-auth">Register here</a>'
        : 'Already have an account? <a href="#" id="toggle-auth">Login here</a>';
    
    // Re-attach listener because innerHTML wipes it
    document.getElementById('toggle-auth').onclick = () => toggleBtn.click();
});

authForm.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('user-email').value;
    const pass = document.getElementById('user-password').value;
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    if (isLoginMode) {
        // LOGIN LOGIC
        const user = users.find(u => u.email === email && u.password === pass);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = '../index.html'; // Redirect to calendar
        } else {
            alert('Invalid email or password.');
        }
    } else {
        // REGISTER LOGIC
        const name = document.getElementById('user-name').value;
        if (users.find(u => u.email === email)) {
            alert('User already exists!');
            return;
        }
        users.push({ name, email, password: pass });
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        alert('Registration successful! Please login.');
        location.reload();
    }
};

// --- Guest Login Logic ---

const guestBtn = document.getElementById('guest-btn');

guestBtn.addEventListener('click', () => {
    const guestId = generateGuestId();
    
    const guestUser = {
        name: "Guest User",
        email: `guest_${guestId.substring(0, 5)}@local`,
        id: guestId,
        isGuest: true
    };

    // Store in session so the app knows who is logged in
    localStorage.setItem('currentUser', JSON.stringify(guestUser));
    
    alert(`Logged in as Guest\nID: ${guestId}`);
    window.location.href = '../index.html'; 
});

/**
 * Generates a pseudo-unique ID based on browser properties
 * (Simulates a Desktop/Phone ID)
 */
function generateGuestId() {
    // Collect browser fingerprint data
    const platform = navigator.platform;
    const screenWidth = window.screen.width;
    const randomBits = Math.random().toString(36).substr(2, 9);
    
    // Create a unique string
    const rawId = `${platform}-${screenWidth}-${randomBits}`;
    
    // Hash-like simple encoding
    return btoa(rawId).substring(0, 12).toUpperCase();
}

// --- Keep existing Login/Register logic below ---

// ... (Your previous authForm.onsubmit code)





