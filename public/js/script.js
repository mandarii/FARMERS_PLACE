const apiBase = 'http://localhost:5000'; 

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
        localStorage.setItem('token', data.token); 


        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert(data.message);
    }
});

category: document.getElementById('category').value

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token'); // Get the token from local storage

    // Fetch products from the server
    fetch('/products', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(products => {
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';

        if (products.length === 0) {
            productsList.innerHTML = '<p>No products found.</p>';
        } else {
            products.forEach(product => {
                const productItem = document.createElement('li');
                productItem.innerHTML = `
                    <strong>${product.name}</strong><br>
                    Description: ${product.description}<br>
                    Price: ${product.price}<br>
                    Quantity: ${product.quantity}<br>
                `;
                productsList.appendChild(productItem);
            });
        }
    })
    .catch(error => console.error('Error fetching products:', error));
});

document.getElementById('orderForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productId = document.getElementById('productId').value;
    const quantity = document.getElementById('quantity').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, quantity }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            fetchOrders(); 
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error placing order:', error);
    }
});

async function fetchOrders() {
    const token = localStorage.getItem('token');
    const response = await fetch('/orders', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    const orders = await response.json();
    const ordersList = document.getElementById('orders');
    ordersList.innerHTML = '';

    orders.forEach(order => {
        const listItem = document.createElement('li');
        listItem.textContent = `Order ID: ${order.id}, Product: ${order.Product.name}, Quantity: ${order.quantity}`;
        ordersList.appendChild(listItem);
    });
}

document.addEventListener('DOMContentLoaded', fetchOrders);

