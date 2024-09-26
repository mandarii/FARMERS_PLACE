const apiBase = 'http://localhost:5000'; // Change to your backend URL

// Register User
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    const res = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (res.status === 201) {
        alert('User registered successfully!');
        window.location.href = 'login.html';
    } else {
        alert(data.message);
    }
});

// Login User
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.status === 200) {
        localStorage.setItem('token', data.token);  // Store JWT in local storage
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert(data.message);
    }
});

// Load User Info on Dashboard
//const token = localStorage.getItem('token');
//if (token && window.location.pathname === '/);
