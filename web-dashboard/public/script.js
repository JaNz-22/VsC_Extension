const API_BASE = 'http://localhost:5000/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    checkLocalStorage();
    setupEventListeners();
});

function checkLocalStorage() {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        showDashboard(currentUser);
    }
}

function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const apiKeyForm = document.getElementById('apiKeyForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (apiKeyForm) {
        apiKeyForm.addEventListener('submit', handleApiKeyLogin);
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tab === 'login') {
        document.querySelector('[onclick*="login"]').classList.add('active');
        document.getElementById('loginTab').classList.add('active');
    } else {
        document.querySelector('[onclick*="signup"]').classList.add('active');
        document.getElementById('signupTab').classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.error || 'Login failed', 'error');
            return;
        }

        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        showNotification('Login successful!', 'success');
        showDashboard(currentUser);
    } catch (error) {
        showNotification('Error connecting to server', 'error');
        console.error(error);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const apiKey = document.getElementById('signupApiKey').value;

    if (!apiKey.startsWith('sk-')) {
        showNotification('Invalid API key format', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, apiKey })
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.error || 'Signup failed', 'error');
            return;
        }

        showNotification('Account created successfully! Please login.', 'success');
        setTimeout(() => switchTab('login'), 1500);
    } catch (error) {
        showNotification('Error connecting to server', 'error');
        console.error(error);
    }
}

async function handleApiKeyLogin(e) {
    e.preventDefault();
    const name = document.getElementById('apiKeyName').value;
    const email = document.getElementById('apiKeyEmail').value;
    const apiKey = document.getElementById('apiKey').value;

    if (!apiKey.startsWith('sk-')) {
        showNotification('Invalid API key format', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login-with-apikey`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, apiKey })
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.error || 'Login failed', 'error');
            return;
        }

        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        showNotification('Login successful!', 'success');
        showDashboard(currentUser);
    } catch (error) {
        showNotification('Error connecting to server', 'error');
        console.error(error);
    }
}

function showDashboard(user) {
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('dashboardContainer').classList.remove('hidden');

    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('displayName').value = user.name;
    document.getElementById('userApiKey').value = user.apiKey || '';

    if (user.createdAt) {
        const createdDate = new Date(user.createdAt).toLocaleDateString();
        document.getElementById('createdDate').textContent = createdDate;
    }
}

async function updateUserSettings() {
    const name = document.getElementById('displayName').value;
    const apiKey = document.getElementById('userApiKey').value;

    if (!name) {
        showNotification('Display name is required', 'error');
        return;
    }

    if (apiKey && !apiKey.startsWith('sk-')) {
        showNotification('Invalid API key format', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users/${currentUser.email}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, apiKey: apiKey || undefined })
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.error || 'Update failed', 'error');
            return;
        }

        currentUser.name = name;
        if (apiKey) {
            currentUser.apiKey = apiKey;
        }
        localStorage.setItem('user', JSON.stringify(currentUser));
        document.getElementById('userName').textContent = name;

        showNotification('Settings updated successfully!', 'success');
    } catch (error) {
        showNotification('Error updating settings', 'error');
        console.error(error);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        currentUser = null;
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('dashboardContainer').classList.add('hidden');
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
        document.getElementById('apiKeyForm').reset();
        switchTab('login');
        showNotification('Logged out successfully', 'success');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
