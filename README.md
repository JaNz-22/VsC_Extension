# Aiutante - AI Code Assistant

**An intelligent VS Code extension powered by OpenAI's latest models**

An AI-powered VS Code extension that helps you generate code, fix bugs, and check for errors using OpenAI's API.

## Features

✨ **Generate Code** - Describe the code you need and let AI generate it for you
🔧 **Fix Code** - Select buggy code and automatically fix it with AI assistance
✅ **Check Errors** - Analyze code for potential bugs and issues with detailed reports
🔍 **Code Review** - Comprehensive code analysis for quality, best practices, and improvement suggestions
💬 **AI Chat** - Have interactive conversations about coding topics
📊 **Dashboard** - View statistics, manage your account, and access settings
🌐 **Web Dashboard** - Manage your account from any web browser

## Quick Start

### Setup

1. **Clone the repository** and navigate to the project directory
2. **Run the setup script**:
   - On Linux/Mac: `bash start.sh`
   - On Windows: `start.bat`
3. This will install dependencies and compile the extension

### Using the Extension

1. **Get an OpenAI API Key**:
   - Visit [OpenAI API](https://platform.openai.com/api-keys)
   - Create a new API key

2. **Login to the extension**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Search for: **Login to AI Service**
   - Enter your name, email, and API key

3. **Use the commands**:
   - Press `Ctrl+Shift+P` and search for:
     - **Generate Code** - Create new code
     - **Fix Code** - Fix bugs in selected code
     - **Check Errors** - Analyze code for issues
     - **Code Review** - Get comprehensive code analysis
     - **Open AI Chat** - Chat with AI
     - **Open AI Dashboard** - View your dashboard
   - Or right-click in the editor and select from the context menu

### Web Dashboard

The project includes a web-based dashboard for managing your account:

1. **Start the dashboard server**:
   ```bash
   cd web-dashboard
   npm install
   npm start
   ```

2. **Access the dashboard**:
   - Open http://localhost:5000 in your browser
   - Register or login to your account
   - Manage your OpenAI API key
   - View account statistics

## How to Use

### Generate Code
1. Open the command palette (`Ctrl+Shift+P`)
2. Type "Generate Code"
3. Describe what code you want to create
4. AI will generate and insert the code at your cursor position

### Fix Code
1. Select the code you want to fix
2. Open the command palette (`Ctrl+Shift+P`)
3. Type "Fix Code"
4. AI will analyze and replace the selected code with fixed version

### Check Errors
1. Select code or leave cursor anywhere in the file (will analyze full file)
2. Open the command palette (`Ctrl+Shift+P`)
3. Type "Check Errors"
4. View detailed error analysis in a side panel

### Code Review
1. Select code or leave cursor anywhere in the file (will analyze full file)
2. Open the command palette (`Ctrl+Shift+P`)
3. Type "Code Review"
4. View comprehensive code analysis including quality assessment, best practices, and improvement suggestions

## Requirements

- VS Code 1.60.0 or higher
- OpenAI API key (free tier available)
- Internet connection

## Configuration

The extension will prompt you for your OpenAI API key on first use. Your key is saved securely in VS Code settings.

**Available Settings:**
- **Model**: Choose between GPT-3.5-turbo, GPT-4, or GPT-4 Turbo
- **Temperature**: Control randomness in AI responses (0-2)
- **Max Tokens**: Set maximum response length (100-4000)
- **Feature Toggles**: Enable/disable specific features

**To access settings:**
1. Press `Ctrl+,` to open Settings
2. Search for "AI Code Assistant" or "aiExtension"
3. Configure your preferences

## Project Structure

- **VS Code Extension** (`src/`) - Main extension code with commands and services
- **Web Dashboard** (`web-dashboard/`) - Express.js backend with HTML/CSS/JS frontend
- **Tests** (`src/test/`) - Unit and integration tests
- **Configuration** (`package.json`, `webpack.config.js`) - Build and deployment config

## Architecture

### VS Code Extension
- Built with TypeScript and Webpack
- Uses VS Code API for UI and file operations
- Communicates with OpenAI via axios HTTP client
- Stores user data in VS Code settings

### Web Dashboard
- Express.js backend server
- HTML/CSS/JavaScript frontend
- Local JSON file storage (development)
- CORS-enabled for local development

## Installation Troubleshooting

### If `npm install` fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### If extension won't load
1. Ensure VS Code version is 1.60.0 or higher
2. Run `npm run compile` to generate the bundle
3. Reload the VS Code window (F5)
4. Check the extension output for errors

### If dashboard won't start
1. Ensure port 5000 is not in use
2. Check Node.js version (v14+)
3. Try `npm install` in the web-dashboard folder
4. Check for syntax errors with `node server.js`

## Advanced Configuration

### Custom OpenAI Models
Edit your VS Code settings to use different models:
- `gpt-3.5-turbo` (faster, cheaper)
- `gpt-4` (more capable)
- `gpt-4-turbo-preview` (latest)

### Environment Variables
Create `.env` files in both root and `web-dashboard/` directories:
```
PORT=5000
NODE_ENV=development
```

## Development

See [SETUP.md](SETUP.md) for detailed development guide including:
- Adding new commands
- Creating new services
- Running tests
- Deploying to marketplace
- Hosting the web dashboard

## Support & Issues

For bug reports and feature requests, visit:
[GitHub Issues](https://github.com/JaNz-22/VSC_Extension/issues)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

MIT

## Changelog

### Version 1.0.0
- ✨ Initial release
- 🤖 AI Code Generation
- 🔧 Code Fixing
- ✅ Error Checking
- 🔍 Code Review
- 💬 AI Chat
- 📊 Dashboard
- 🌐 Web Dashboard for account management# VsC_Extension
