// checking  user is login or not If he is login then show logout btn or login form
if(localStorage.getItem('user')){
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('Logout-btn').style.display = 'block';
} else {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('Logout-btn').style.display = 'none';
}
// click on logout btn clean local storage and reload the window 
document.getElementById("Logout-btn").addEventListener("click", function (event) {
    localStorage.clear();
    window.location.reload();
});

// this is used hide and show registration and login form 
document.getElementById("clickreg").addEventListener("click", function (event) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

// This is used in show and hide login and registeration form
document.getElementById("clickalgaccount").addEventListener("click", function (event) {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
});


// Email and Password Varification API with for Id
document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const reqBody = JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
    });
    // Make a POST request to your /login endpoint (using Fetch API, jQuery, or similar)
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: reqBody
    })
        .then(response => response.json())
        .then(data => {
            console.log("daksjdkajsndkjansd", data);
            // Assuming the response includes user data like user.id, user.username, etc.
            if (data.data.id) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(data));
                // Redirect to the home page or perform other actions
                // window.location.href = '/home';
                Toastify({
                    text: "user is login successfully",
                    close: true,
                    gravity: "top", // `top` or `bottom`
                    position: "right", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                  }).showToast();
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('Logout-btn').style.display = 'block';
            } else {
                alert('Login failed. Please check your username and password.');
            }
        });
});


// Email and Password Varification API with for Id
document.getElementById("register-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const reqBody = JSON.stringify({
        username: document.getElementById("reg-username").value,
        password: document.getElementById("reg-password").value,
        phone: document.getElementById("phone").value,
    });
    // Make a POST request to your /register endpoint (using Fetch API, jQuery, or similar)
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: reqBody
    })
        .then(response => response.json())
        .then(data => {
            // Assuming the response includes user data like user.id, user.username, etc.
            if (data) {
                // Store user data in localStorage
                // Redirect to the home page or perform other actions
                // window.location.href = '/home';
                Toastify({
                    text: "user is Register successfully",
                    close: true,
                    gravity: "top", // `top` or `bottom`
                    position: "right", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                  }).showToast();
                  document.getElementById('login-form').style.display = 'block';
                  document.getElementById('register-form').style.display = 'none';
            } else {
                alert('Login failed. Please check your username and password.');
            }
        });
});