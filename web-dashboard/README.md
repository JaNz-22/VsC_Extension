# Aiutante Web Dashboard

A web-based dashboard for managing your Aiutante AI Code Assistant account.

## Features

- User registration and login
- OpenAI API key management
- User account settings
- Dashboard with user statistics
- Quick access to extension features

## Installation

```bash
npm install
```

## Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The dashboard will be available at `http://localhost:5000`

## Environment Variables

Create a `.env` file based on `.env.example`:

```
PORT=5000
NODE_ENV=development
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/login-with-apikey` - Login with API key only
- `POST /api/auth/logout` - Logout user

### User Management

- `GET /api/users/:email` - Get user profile
- `PUT /api/users/:email` - Update user profile
- `POST /api/auth/verify-api-key` - Verify API key format

## Data Storage

User data is stored locally in `data/users.json`. For production, consider using a database like MongoDB or PostgreSQL.

## Security Notes

- Passwords are base64 encoded (for development only)
- In production, use bcrypt for password hashing
- Implement JWT tokens for session management
- Use HTTPS in production
- Store API keys securely

## Integration with VS Code Extension

1. Open the Aiutante VS Code extension
2. Run the command: `Extension.login`
3. Enter your email and API key from this dashboard
4. Your extension will be connected to your account
