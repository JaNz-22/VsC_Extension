import * as vscode from 'vscode';
import { UserService } from '../services/userService';

export async function loginCommand() {
    const panel = vscode.window.createWebviewPanel(
        'aiLogin',
        'AI Service Login',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: []
        }
    );

    panel.webview.html = getLoginHtml();

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        async (message) => {
            switch (message.type) {
                case 'login':
                    try {
                        await UserService.loginWithApiKey(
                            message.userName || 'User',
                            message.userEmail || '',
                            message.apiKey
                        );

                        vscode.window.showInformationMessage('Successfully logged in to AI service!');
                        panel.dispose();
                    } catch (error) {
                        vscode.window.showErrorMessage(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                    break;
                case 'signup':
                    try {
                        await UserService.register(
                            message.userName,
                            message.userEmail || '',
                            message.password || '',
                            message.apiKey
                        );

                        vscode.window.showInformationMessage('Account created successfully!');
                        panel.dispose();
                    } catch (error) {
                        vscode.window.showErrorMessage(`Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                    break;
                case 'cancel':
                    panel.dispose();
                    break;
            }
        },
        undefined,
        []
    );
}

function getLoginHtml(): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Service Login</title>
            <style>
                .tabs {
                    display: flex;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                .tab {
                    flex: 1;
                    padding: 12px;
                    text-align: center;
                    cursor: pointer;
                    background: none;
                    border: none;
                    color: var(--vscode-descriptionForeground);
                    font-family: inherit;
                    font-size: inherit;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .tab.active {
                    color: var(--vscode-textLink-foreground);
                    border-bottom-color: var(--vscode-textLink-foreground);
                }
                .tab-content {
                    display: none;
                }
                .tab-content.active {
                    display: block;
                }
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .login-container {
                    background-color: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 6px;
                    padding: 24px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 24px;
                }
                .login-header h1 {
                    margin: 0 0 8px 0;
                    font-size: 1.5em;
                    font-weight: 600;
                    color: var(--vscode-editor-foreground);
                }
                .login-header p {
                    margin: 0;
                    color: var(--vscode-descriptionForeground);
                    font-size: 0.9em;
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: var(--vscode-editor-foreground);
                }
                .form-group input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 3px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    font-family: inherit;
                    font-size: inherit;
                    box-sizing: border-box;
                }
                .form-group input:focus {
                    outline: none;
                    border-color: var(--vscode-focusBorder);
                }
                .form-group input::placeholder {
                    color: var(--vscode-input-placeholderForeground);
                }
                .button-group {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }
                .btn {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    border-radius: 3px;
                    font-family: inherit;
                    font-size: inherit;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .btn-primary {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                .btn-primary:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .btn-secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                .btn-secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                .help-text {
                    margin-top: 16px;
                    font-size: 0.8em;
                    color: var(--vscode-descriptionForeground);
                    text-align: center;
                }
                .help-text a {
                    color: var(--vscode-textLink-foreground);
                    text-decoration: none;
                }
                .help-text a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <div class="login-header">
                    <h1>AI Assistant</h1>
                    <p>Access AI-powered coding features</p>
                </div>

                <div class="tabs">
                    <button class="tab active" onclick="switchTab('login')">Login</button>
                    <button class="tab" onclick="switchTab('signup')">Sign Up</button>
                </div>

                <div id="loginTab" class="tab-content active">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginUserName">Display Name</label>
                            <input
                                type="text"
                                id="loginUserName"
                                name="userName"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="loginUserEmail">Email</label>
                            <input
                                type="email"
                                id="loginUserEmail"
                                name="userEmail"
                                placeholder="your.email@example.com"
                            />
                        </div>
                        <div class="form-group">
                            <label for="loginApiKey">OpenAI API Key</label>
                            <input
                                type="password"
                                id="loginApiKey"
                                name="apiKey"
                                placeholder="sk-..."
                                required
                            />
                        </div>
                        <div class="button-group">
                            <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                            <button type="submit" class="btn btn-primary">Login</button>
                        </div>
                    </form>
                </div>

                <div id="signupTab" class="tab-content">
                    <form id="signupForm">
                        <div class="form-group">
                            <label for="signupUserName">Display Name</label>
                            <input
                                type="text"
                                id="signupUserName"
                                name="userName"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="signupUserEmail">Email</label>
                            <input
                                type="email"
                                id="signupUserEmail"
                                name="userEmail"
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">Password</label>
                            <input
                                type="password"
                                id="signupPassword"
                                name="password"
                                placeholder="Create a password"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="signupApiKey">OpenAI API Key</label>
                            <input
                                type="password"
                                id="signupApiKey"
                                name="apiKey"
                                placeholder="sk-..."
                                required
                            />
                        </div>
                        <div class="button-group">
                            <button type="button" class="btn btn-secondary" onclick="switchTab('login')">Back to Login</button>
                            <button type="submit" class="btn btn-primary">Sign Up</button>
                        </div>
                    </form>
                </div>
                <div class="help-text">
                    Don't have an API key?
                    <a href="https://platform.openai.com/api-keys" target="_blank">Get one here</a>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const loginForm = document.getElementById('loginForm');
                const signupForm = document.getElementById('signupForm');
                const cancelBtn = document.getElementById('cancelBtn');

                function switchTab(tabName) {
                    // Update tab buttons
                    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                    if (tabName === 'login') {
                        document.querySelector('button[onclick="switchTab(\'login\')"]').classList.add('active');
                        document.getElementById('loginTab').classList.add('active');
                    } else {
                        document.querySelector('button[onclick="switchTab(\'signup\')"]').classList.add('active');
                        document.getElementById('signupTab').classList.add('active');
                    }
                }

                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const userName = document.getElementById('loginUserName').value.trim();
                    const userEmail = document.getElementById('loginUserEmail').value.trim();
                    const apiKey = document.getElementById('loginApiKey').value.trim();

                    if (userName && apiKey) {
                        vscode.postMessage({
                            type: 'login',
                            userName: userName,
                            userEmail: userEmail,
                            apiKey: apiKey
                        });
                    }
                });

                signupForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const userName = document.getElementById('signupUserName').value.trim();
                    const userEmail = document.getElementById('signupUserEmail').value.trim();
                    const password = document.getElementById('signupPassword').value.trim();
                    const apiKey = document.getElementById('signupApiKey').value.trim();

                    if (userName && userEmail && password && apiKey) {
                        vscode.postMessage({
                            type: 'signup',
                            userName: userName,
                            userEmail: userEmail,
                            password: password,
                            apiKey: apiKey
                        });
                    }
                });

                cancelBtn.addEventListener('click', () => {
                    vscode.postMessage({
                        type: 'cancel'
                    });
                });

                // Focus on the input field when the webview loads
                document.getElementById('loginUserName').focus();
            </script>
        </body>
        </html>
    `;
}