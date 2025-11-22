const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const usersFilePath = path.join(__dirname, 'data', 'users.json');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
}

const getUsers = () => {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
};

const saveUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/auth/register', (req, res) => {
    const { email, name, password, apiKey } = req.body;

    if (!email || !name || !password || !apiKey) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const users = getUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: Buffer.from(password).toString('base64'),
        apiKey,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const storedPassword = Buffer.from(user.password, 'base64').toString();
    if (storedPassword !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    user.lastLoginAt = new Date().toISOString();
    saveUsers(users);

    res.json({
        message: 'Login successful',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            apiKey: user.apiKey
        }
    });
});

app.post('/api/auth/verify-api-key', (req, res) => {
    const { apiKey } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
    }

    if (!apiKey.startsWith('sk-')) {
        return res.status(400).json({ error: 'Invalid API key format' });
    }

    res.json({
        valid: true,
        message: 'API key format is valid'
    });
});

app.post('/api/auth/login-with-apikey', (req, res) => {
    const { email, name, apiKey } = req.body;

    if (!email || !name || !apiKey) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!apiKey.startsWith('sk-')) {
        return res.status(400).json({ error: 'Invalid API key format' });
    }

    const users = getUsers();
    let user = users.find(u => u.email === email);

    if (user) {
        user.name = name;
        user.apiKey = apiKey;
        user.lastLoginAt = new Date().toISOString();
    } else {
        user = {
            id: Date.now().toString(),
            name,
            email,
            password: '',
            apiKey,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
        };
        users.push(user);
    }

    saveUsers(users);

    res.json({
        message: 'Login successful',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            apiKey: user.apiKey
        }
    });
});

app.get('/api/users/:email', (req, res) => {
    const { email } = req.params;
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
        }
    });
});

app.put('/api/users/:email', (req, res) => {
    const { email } = req.params;
    const { name, apiKey } = req.body;

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (apiKey) user.apiKey = apiKey;

    saveUsers(users);

    res.json({
        message: 'User updated successfully',
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Aiutante Web Dashboard running on http://localhost:${PORT}`);
});
