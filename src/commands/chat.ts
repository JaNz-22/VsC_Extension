import * as vscode from 'vscode';
import { callAI, getApiKey } from '../services/apiService';
import { trackUsage } from '../services/usageService';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export async function chat() {
    const panel = vscode.window.createWebviewPanel(
        'aiChat',
        'AI Chat Assistant',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: []
        }
    );

    let chatHistory: ChatMessage[] = [];
    const loadingState = { isLoading: false };

    panel.webview.html = getChatHtml(chatHistory);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        async (message) => {
            switch (message.type) {
                case 'sendMessage':
                    await handleSendMessage(panel, message.content, chatHistory, loadingState);
                    break;
                case 'clearChat':
                    chatHistory = [];
                    panel.webview.html = getChatHtml(chatHistory);
                    break;
                case 'openDashboard':
                    await vscode.commands.executeCommand('extension.dashboard');
                    break;
            }
        },
        undefined,
        []
    );
}

async function handleSendMessage(panel: vscode.WebviewPanel, content: string, chatHistory: ChatMessage[], loadingState: { isLoading: boolean }) {
    if (!content.trim() || loadingState.isLoading) return;

    loadingState.isLoading = true;

    // Add user message to history
    const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date()
    };

    chatHistory.push(userMessage);

    // Update UI with user message
    panel.webview.html = getChatHtml(chatHistory, true);

    try {
        const apiKey = await getApiKey();

        // Prepare messages for API
        const messages = chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const response = await callAI(content, apiKey);

        // Add assistant message to history
        const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date()
        };

        chatHistory.push(assistantMessage);

        // Track usage
        await trackUsage('generateCode'); // Using generateCode as a general AI interaction metric

        // Update UI with assistant response
        panel.webview.html = getChatHtml(chatHistory, false);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Add error message to history
        const errorResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `❌ Error: ${errorMessage}`,
            timestamp: new Date()
        };

        chatHistory.push(errorResponse);
        panel.webview.html = getChatHtml(chatHistory, false);
    } finally {
        loadingState.isLoading = false;
    }
}

function getChatHtml(chatHistory: ChatMessage[], isLoading = false): string {
    const messagesHtml = chatHistory.map(message => `
        <div class="message ${message.role}">
            <div class="message-avatar">
                ${message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div class="message-content">
                <div class="message-text">${formatMessage(message.content)}</div>
                <div class="message-time">${formatTime(message.timestamp)}</div>
            </div>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Chat Assistant</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 20px;
                    background-color: var(--vscode-titleBar-activeBackground);
                    border-bottom: 1px solid var(--vscode-titleBar-border);
                }
                .header h1 {
                    margin: 0;
                    font-size: 1.2em;
                    color: var(--vscode-titleBar-activeForeground);
                }
                .header-actions {
                    display: flex;
                    gap: 8px;
                }
                .header-btn {
                    background: none;
                    border: none;
                    color: var(--vscode-titleBar-activeForeground);
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-size: 0.9em;
                }
                .header-btn:hover {
                    background-color: var(--vscode-toolbar-hoverBackground);
                }
                .chat-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .message {
                    display: flex;
                    gap: 12px;
                    max-width: 80%;
                    animation: fadeIn 0.3s ease-in;
                }
                .message.user {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }
                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2em;
                    flex-shrink: 0;
                }
                .message.user .message-avatar {
                    background-color: var(--vscode-textLink-foreground);
                    color: white;
                }
                .message.assistant .message-avatar {
                    background-color: var(--vscode-notificationsInfoIcon-foreground);
                    color: white;
                }
                .message-content {
                    background-color: var(--vscode-input-background);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 8px;
                    padding: 12px 16px;
                    position: relative;
                }
                .message.user .message-content {
                    background-color: var(--vscode-textLink-foreground);
                    color: white;
                    border-color: var(--vscode-textLink-foreground);
                }
                .message-text {
                    line-height: 1.5;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                .message-text code {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 2px 4px;
                    border-radius: 3px;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 0.9em;
                }
                .message.user .message-text code {
                    background-color: rgba(255, 255, 255, 0.2);
                }
                .message-time {
                    font-size: 0.8em;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 4px;
                    text-align: right;
                }
                .message.user .message-time {
                    color: rgba(255, 255, 255, 0.7);
                }
                .input-container {
                    border-top: 1px solid var(--vscode-panel-border);
                    padding: 16px 20px;
                    background-color: var(--vscode-editorWidget-background);
                }
                .input-form {
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                }
                .input-wrapper {
                    flex: 1;
                    position: relative;
                }
                .input-field {
                    width: 100%;
                    min-height: 40px;
                    max-height: 120px;
                    padding: 10px 12px;
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 6px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    font-family: inherit;
                    font-size: inherit;
                    resize: none;
                    outline: none;
                    box-sizing: border-box;
                }
                .input-field:focus {
                    border-color: var(--vscode-focusBorder);
                }
                .input-field::placeholder {
                    color: var(--vscode-input-placeholderForeground);
                }
                .send-btn {
                    padding: 10px 16px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }
                .send-btn:hover:not(:disabled) {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .send-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .loading {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    color: var(--vscode-descriptionForeground);
                    font-style: italic;
                }
                .loading::before {
                    content: '';
                    width: 16px;
                    height: 16px;
                    border: 2px solid var(--vscode-progressBar-background);
                    border-top: 2px solid var(--vscode-textLink-foreground);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    padding: 40px;
                }
                .empty-state h2 {
                    margin: 0 0 16px 0;
                    color: var(--vscode-editor-foreground);
                }
                .empty-state p {
                    margin: 0 0 24px 0;
                    max-width: 400px;
                    line-height: 1.5;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .suggestions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .suggestion-btn {
                    background: none;
                    border: 1px solid var(--vscode-button-border);
                    color: var(--vscode-button-foreground);
                    padding: 6px 12px;
                    border-radius: 16px;
                    cursor: pointer;
                    font-size: 0.85em;
                    transition: all 0.2s;
                }
                .suggestion-btn:hover {
                    background-color: var(--vscode-button-hoverBackground);
                    border-color: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>AI Chat Assistant</h1>
                <div class="header-actions">
                    <button class="header-btn" onclick="openDashboard()">📊 Dashboard</button>
                    <button class="header-btn" onclick="clearChat()">🗑️ Clear</button>
                </div>
            </div>

            <div class="chat-container">
                ${chatHistory.length === 0 ? `
                    <div class="empty-state">
                        <h2>👋 Welcome to AI Chat!</h2>
                        <p>Ask me anything about coding, debugging, refactoring, or get help with your development tasks.</p>
                        <div class="suggestions">
                            <button class="suggestion-btn" onclick="sendSuggestion('Help me write a function to reverse a string in JavaScript')">Reverse a string</button>
                            <button class="suggestion-btn" onclick="sendSuggestion('Explain how recursion works with an example')">Explain recursion</button>
                            <button class="suggestion-btn" onclick="sendSuggestion('What are the best practices for React component naming?')">React best practices</button>
                            <button class="suggestion-btn" onclick="sendSuggestion('Help me debug this error: TypeError: Cannot read property of undefined')">Debug an error</button>
                        </div>
                    </div>
                ` : `
                    <div class="messages" id="messages">
                        ${messagesHtml}
                    </div>
                `}

                ${isLoading ? `
                    <div class="loading">
                        AI is thinking...
                    </div>
                ` : ''}

                <div class="input-container">
                    <form class="input-form" id="messageForm">
                        <div class="input-wrapper">
                            <textarea
                                class="input-field"
                                id="messageInput"
                                placeholder="Ask me anything about coding..."
                                rows="1"
                                maxlength="4000"
                            ></textarea>
                        </div>
                        <button type="submit" class="send-btn" id="sendBtn">
                            Send
                        </button>
                    </form>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const messageForm = document.getElementById('messageForm');
                const messageInput = document.getElementById('messageInput');
                const sendBtn = document.getElementById('sendBtn');
                const messagesContainer = document.getElementById('messages');

                // Auto-resize textarea
                messageInput.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
                });

                // Handle form submission
                messageForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const content = messageInput.value.trim();
                    if (content) {
                        vscode.postMessage({ type: 'sendMessage', content: content });
                        messageInput.value = '';
                        messageInput.style.height = 'auto';
                        sendBtn.disabled = true;
                        messageInput.focus();
                    }
                });

                // Enable/disable send button based on input
                messageInput.addEventListener('input', function() {
                    sendBtn.disabled = !this.value.trim();
                });

                // Handle Enter key (send on Enter, new line on Shift+Enter)
                messageInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        messageForm.dispatchEvent(new Event('submit'));
                    }
                });

                function clearChat() {
                    vscode.postMessage({ type: 'clearChat' });
                }

                function openDashboard() {
                    vscode.postMessage({ type: 'openDashboard' });
                }

                function sendSuggestion(suggestion) {
                    messageInput.value = suggestion;
                    messageInput.style.height = 'auto';
                    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
                    sendBtn.disabled = false;
                    messageInput.focus();
                }

                // Scroll to bottom when new messages arrive
                function scrollToBottom() {
                    if (messagesContainer) {
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                }

                // Scroll to bottom on load
                setTimeout(scrollToBottom, 100);
            </script>
        </body>
        </html>
    `;
}

function formatMessage(content: string): string {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}