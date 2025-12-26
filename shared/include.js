function loadNavbar() {
    fetch('../shared/nav.html') // Change path to where your nav.html is stored
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
            
            // IMPORTANT: Re-run your Navbar logic after it's loaded
            initMenuToggle();
            initSessionDisplay();
        });
}

function initMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    
    if (menuToggle && menu) {
        // Clear any previous click events to avoid double-toggling
        menuToggle.onclick = null; 
        
        menuToggle.onclick = (e) => {
            e.preventDefault();
            menu.classList.toggle('show'); // This MUST match the CSS .show class
            console.log("Menu toggled"); // Debugging line
        };
    }
}

function initSessionDisplay() {
    const userJson = localStorage.getItem('currentUser');
    const nameDisplay = document.getElementById('user-display-name');
    if (userJson && nameDisplay) {
        const user = JSON.parse(userJson);
        nameDisplay.innerText = user.isGuest ? `Guest: ${user.id}` : user.name;
    }
}

// Run the loader
document.addEventListener('DOMContentLoaded', loadNavbar);