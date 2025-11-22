# Aiutante - Setup Guide

Complete guide to set up and run the Aiutante AI Code Assistant extension and web dashboard.

## Project Structure

```
VsC_Extension/
├── src/                          # VS Code Extension source code
│   ├── commands/                 # Extension commands
│   │   ├── chat.ts              # AI Chat interface
│   │   ├── generateCode.ts       # Code generation
│   │   ├── fixCode.ts           # Code fixing
│   │   ├── checkErrors.ts       # Error checking
│   │   ├── codeReview.ts        # Code review
│   │   ├── loginCommand.ts      # Login interface
│   │   ├── dashboard.ts         # Dashboard interface
│   │   └── helloCommand.ts      # Hello command
│   ├── services/                 # Business logic
│   │   ├── apiService.ts        # OpenAI API integration
│   │   ├── userService.ts       # User management
│   │   └── usageService.ts      # Usage tracking
│   ├── test/                     # Tests
│   └── extension.ts             # Extension entry point
├── web-dashboard/               # Web Dashboard (separate application)
│   ├── public/                  # Static files
│   │   ├── index.html          # Dashboard UI
│   │   ├── styles.css          # Styling
│   │   └── script.js           # Client logic
│   ├── server.js               # Express server
│   ├── package.json            # Dependencies
│   └── README.md               # Dashboard documentation
├── package.json                # Extension dependencies
└── README.md                   # Project documentation
```

## Prerequisites

- Node.js v14+ and npm
- VS Code v1.60.0+
- OpenAI API key (get from https://platform.openai.com/api-keys)

## Installation

### 1. Install VS Code Extension

```bash
cd /home/adanieller/VsC_Extension

# Install dependencies
npm install

# Compile the extension
npm run compile

# Run tests
npm test
```

### 2. Set Up Web Dashboard

```bash
cd web-dashboard

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the server
npm start
```

The dashboard will be available at `http://localhost:5000`

## Running the Extension

### Development Mode

```bash
# In the main project directory
npm run watch
```

This watches for changes and recompiles automatically.

### Building for Production

```bash
npm run vscode:prepublish
```

## Using the Extension

### In VS Code

1. **Install the extension**: Open VS Code and load the extension from the `out` directory
2. **Login**: 
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Search for "Login to AI Service"
   - Enter your name, email, and OpenAI API key
3. **Use AI features**: 
   - Open command palette (`Ctrl+Shift+P`)
   - Choose from available commands:
     - Generate Code
     - Fix Code
     - Check Errors
     - Code Review
     - Open AI Chat
     - Open AI Dashboard

### Features

#### 🎨 Generate Code
Describe what code you need and let AI generate it.
```
Command: Extension.generateCode
```

#### 🔧 Fix Code
Select buggy code and automatically fix it.
```
Command: Extension.fixCode
```

#### ✅ Check Errors
Analyze code for potential bugs and issues.
```
Command: Extension.checkErrors
```

#### 🔍 Code Review
Get comprehensive code analysis and suggestions.
```
Command: Extension.codeReview
```

#### 💬 AI Chat
Have conversations about coding topics.
```
Command: Extension.chat
```

#### 📊 Dashboard
View stats and manage your account.
```
Command: Extension.dashboard
```

## Web Dashboard

### Access

Open your browser and go to `http://localhost:5000`

### Features

- **User Registration**: Create a new account with email and password
- **API Key Management**: Store and manage your OpenAI API key
- **Account Settings**: Update your profile and API key
- **Usage Stats**: View your account activity

### Login Methods

1. **Email + Password**: Traditional login
2. **API Key Only**: Quick login with just your API key and name
3. **Auto-login**: If you have an account with API key saved

## Configuration

### VS Code Settings

Access via File → Preferences → Settings → AI Code Assistant

- **Model**: Choose GPT model (3.5-turbo, GPT-4, etc.)
- **Temperature**: Control response randomness (0-2)
- **Max Tokens**: Set response length (100-4000)
- **Enable/Disable Features**: Toggle specific features on/off

### Environment Variables

Create `.env` file in `web-dashboard/`:

```
PORT=5000
NODE_ENV=development
```

## Testing

### Run Tests

```bash
npm test
```

### Run VS Code Integration Tests

```bash
npm run test:vscode
```

## Troubleshooting

### Extension Won't Load

1. Check VS Code version (requires v1.60.0+)
2. Verify `out/extension.js` exists
3. Try reloading the extension window

### API Errors

1. Verify OpenAI API key is valid
2. Check API key format (should start with `sk-`)
3. Ensure you have API credits available
4. Check internet connection

### Dashboard Not Loading

1. Ensure web-dashboard server is running (`npm start`)
2. Check port 5000 is not in use
3. Try clearing browser cache
4. Check browser console for errors

### Test Failures

1. Run `npm run compile` first
2. Ensure all dependencies are installed
3. Check for TypeScript errors with `npx tsc`

## Development

### Adding a New Command

1. Create a new file in `src/commands/`
2. Export async function with command logic
3. Register in `src/extension.ts`
4. Add to `package.json` activation events and contributions

Example:
```typescript
// src/commands/myCommand.ts
import * as vscode from 'vscode';

export async function myCommand() {
    vscode.window.showInformationMessage('My command!');
}
```

```typescript
// src/extension.ts
import { myCommand } from './commands/myCommand';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.myCommand', myCommand)
    );
}
```

### Adding a New Service

1. Create file in `src/services/`
2. Export functions or classes
3. Use in commands via imports

## Deployment

### VS Code Marketplace

1. Create publisher account on marketplace.visualstudio.com
2. Update `publisher` field in package.json
3. Run `vsce publish`

### Web Dashboard

Deploy to services like:
- Heroku
- AWS
- DigitalOcean
- Vercel (frontend only)
- Netlify (frontend only)

For production:
- Use a real database (MongoDB, PostgreSQL)
- Implement JWT authentication
- Use bcrypt for passwords
- Enable HTTPS
- Add rate limiting

## Support

For issues and questions:
- GitHub Issues: https://github.com/JaNz-22/VSC_Extension/issues
- VS Code Extension Documentation: https://code.visualstudio.com/api

## License

MIT
