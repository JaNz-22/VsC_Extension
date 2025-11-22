import * as vscode from 'vscode';
import { getUsageStats, formatLastActive } from '../services/usageService';
import { UserService } from '../services/userService';

export async function dashboard() {
    const panel = vscode.window.createWebviewPanel(
        'aiDashboard',
        'AI Assistant Dashboard',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: []
        }
    );

    // Get current configuration
    const config = vscode.workspace.getConfiguration('aiExtension');
    const isLoggedIn = config.get<boolean>('isLoggedIn', false);
    const userName = config.get<string>('userName', '');
    const userEmail = config.get<string>('userEmail', '');
    const usageStats = getUsageStats();

    panel.webview.html = getDashboardHtml(isLoggedIn, userName, userEmail, usageStats);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        async (message) => {
            switch (message.type) {
                case 'login':
                    await vscode.commands.executeCommand('extension.login');
                    // Refresh dashboard after login
                    panel.dispose();
                    await vscode.commands.executeCommand('extension.dashboard');
                    break;
                case 'generateCode':
                    await vscode.commands.executeCommand('extension.generateCode');
                    break;
                case 'fixCode':
                    await vscode.commands.executeCommand('extension.fixCode');
                    break;
                case 'checkErrors':
                    await vscode.commands.executeCommand('extension.checkErrors');
                    break;
                case 'codeReview':
                    await vscode.commands.executeCommand('extension.codeReview');
                    break;
                case 'openChat':
                    await vscode.commands.executeCommand('extension.chat');
                    break;
                case 'logout':
                    const logoutChoice = await vscode.window.showWarningMessage(
                        'Are you sure you want to logout?',
                        'Yes',
                        'Cancel'
                    );
                    if (logoutChoice === 'Yes') {
                        await UserService.logout();
                        panel.dispose();
                        await vscode.commands.executeCommand('extension.dashboard');
                    }
                    break;
            }
        },
        undefined,
        []
    );
}

function getDashboardHtml(isLoggedIn: boolean, userName: string, userEmail: string, usageStats: any): string {
    const totalRequests = usageStats.totalRequests || 0;
    const generateCount = usageStats.generateCode || 0;
    const fixCount = usageStats.fixCode || 0;
    const checkCount = usageStats.checkErrors || 0;
    const reviewCount = usageStats.codeReview || 0;
    const lastActive = formatLastActive(usageStats.lastActive || 'Never');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Assistant Dashboard</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    margin: 0;
                    padding: 20px;
                    line-height: 1.5;
                }
                .dashboard-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--vscode-widget-border);
                }
                .header h1 {
                    margin: 0;
                    color: var(--vscode-editor-foreground);
                }
                .user-info {
                    text-align: right;
                }
                .user-name {
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .user-email {
                    color: var(--vscode-descriptionForeground);
                    font-size: 0.9em;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background-color: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                }
                .stat-number {
                    font-size: 2.5em;
                    font-weight: 700;
                    color: var(--vscode-textLink-foreground);
                    margin-bottom: 8px;
                }
                .stat-label {
                    color: var(--vscode-descriptionForeground);
                    font-size: 0.9em;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .action-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 6px;
                    padding: 15px 20px;
                    font-family: inherit;
                    font-size: inherit;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    text-align: center;
                }
                .action-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .action-button.secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                .action-button.secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                .login-prompt {
                    text-align: center;
                    padding: 40px 20px;
                    background-color: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 8px;
                }
                .login-prompt h2 {
                    margin: 0 0 16px 0;
                    color: var(--vscode-editor-foreground);
                }
                .login-prompt p {
                    margin: 0 0 24px 0;
                    color: var(--vscode-descriptionForeground);
                }
                .recent-activity {
                    background-color: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 8px;
                    padding: 20px;
                }
                .recent-activity h3 {
                    margin: 0 0 16px 0;
                    color: var(--vscode-editor-foreground);
                }
                .activity-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--vscode-list-inactiveSelectionBackground);
                }
                .activity-item:last-child {
                    border-bottom: none;
                }
                .activity-name {
                    font-weight: 500;
                }
                .activity-count {
                    color: var(--vscode-textLink-foreground);
                    font-weight: 600;
                }
                .footer-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="dashboard-container">
                <div class="header">
                    <h1>AI Assistant Dashboard</h1>
                    ${isLoggedIn ? `
                        <div class="user-info">
                            <div class="user-name">${userName || 'User'}</div>
                            <div class="user-email">${userEmail || 'No email set'}</div>
                        </div>
                    ` : ''}
                </div>

                ${!isLoggedIn ? `
                    <div class="login-prompt">
                        <h2>Welcome to AI Assistant</h2>
                        <p>Please login to access AI-powered coding features and view your usage statistics.</p>
                        <button class="action-button" onclick="login()">Login / Sign Up</button>
                    </div>
                ` : `
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${totalRequests}</div>
                            <div class="stat-label">Total AI Requests</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${generateCount}</div>
                            <div class="stat-label">Code Generations</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${fixCount}</div>
                            <div class="stat-label">Code Fixes</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${checkCount + reviewCount}</div>
                            <div class="stat-label">Code Reviews</div>
                        </div>
                    </div>

                    <div class="actions-grid">
                        <button class="action-button" onclick="generateCode()">Generate Code</button>
                        <button class="action-button" onclick="fixCode()">Fix Code</button>
                        <button class="action-button" onclick="checkErrors()">Check Errors</button>
                        <button class="action-button" onclick="codeReview()">Code Review</button>
                        <button class="action-button secondary" onclick="openChat()">Open Chat</button>
                    </div>

                    <div class="recent-activity">
                        <h3>Recent Activity</h3>
                        <div class="activity-item">
                            <span class="activity-name">Code Generation</span>
                            <span class="activity-count">${generateCount}</span>
                        </div>
                        <div class="activity-item">
                            <span class="activity-name">Code Fixes</span>
                            <span class="activity-count">${fixCount}</span>
                        </div>
                        <div class="activity-item">
                            <span class="activity-name">Error Checks</span>
                            <span class="activity-count">${checkCount}</span>
                        </div>
                        <div class="activity-item">
                            <span class="activity-name">Code Reviews</span>
                            <span class="activity-count">${reviewCount}</span>
                        </div>
                        <div class="activity-item">
                            <span class="activity-name">Last Active</span>
                            <span class="activity-count">${lastActive}</span>
                        </div>
                    </div>

                    <div class="footer-actions">
                        <button class="action-button secondary" onclick="logout()">Logout</button>
                    </div>
                `}
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function login() {
                    vscode.postMessage({ type: 'login' });
                }

                function generateCode() {
                    vscode.postMessage({ type: 'generateCode' });
                }

                function fixCode() {
                    vscode.postMessage({ type: 'fixCode' });
                }

                function checkErrors() {
                    vscode.postMessage({ type: 'checkErrors' });
                }

                function codeReview() {
                    vscode.postMessage({ type: 'codeReview' });
                }

                function openChat() {
                    vscode.postMessage({ type: 'openChat' });
                }

                function logout() {
                    vscode.postMessage({ type: 'logout' });
                }
            </script>
        </body>
        </html>
    `;
}