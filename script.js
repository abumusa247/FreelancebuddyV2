(function manageSession() {
  const userJson = localStorage.getItem("currentUser");
  const nameDisplay = document.getElementById("user-display-name");

  if (!userJson) {
    // If someone lands on the home page but isn't logged in, send them to Sign In
    window.location.href = "/signin/auth.html";
    return;
  }

  const user = JSON.parse(userJson);

  if (nameDisplay) {
    nameDisplay.innerText = user.isGuest ? `Guest: ${user.id}` : user.name;
  }
})();


function handleLogout() {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "/signin/auth.html";
  }
}

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');

    if (menuToggle && menu) {
        menuToggle.onclick = function() {
            // This toggles the 'active' class on your menu
            menu.classList.toggle('active');
        };
    }

});



