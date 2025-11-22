import * as vscode from 'vscode';
import { callAI, getApiKey } from '../services/apiService';
import { trackUsage } from '../services/usageService';

export async function codeReview() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection) || editor.document.getText();

    if (!selectedText.trim()) {
        vscode.window.showErrorMessage('No code to review');
        return;
    }

    try {
        const apiKey = await getApiKey();
        const languageId = editor.document.languageId;

        const prompt = `Please perform a comprehensive code review of the following ${languageId} code. Analyze for:

1. **Code Quality**: Readability, maintainability, and structure
2. **Best Practices**: Language-specific conventions and patterns
3. **Potential Issues**: Bugs, security concerns, performance problems
4. **Improvements**: Suggestions for refactoring, optimization, or enhancement
5. **Documentation**: Comments and documentation needs

Provide your review in a structured format with clear sections and actionable recommendations.

Code to review:
\`\`\`${languageId}
${selectedText}
\`\`\`

Please format your response with clear headings and bullet points for easy reading.`;

        const response = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Code Review',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Preparing analysis...' });

            progress.report({ increment: 20, message: 'Analyzing code quality...' });

            progress.report({ increment: 40, message: 'Checking best practices...' });

            progress.report({ increment: 60, message: 'Sending to AI service...' });

            const result = await callAI(prompt, apiKey);

            progress.report({ increment: 80, message: 'Generating report...' });

            return result;
        });

        const panel = vscode.window.createWebviewPanel(
            'codeReview',
            'Code Review Report',
            vscode.ViewColumn.Beside,
            {
                enableScripts: false,
                localResourceRoots: []
            }
        );

        panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        margin: 0;
                        padding: 20px;
                        line-height: 1.6;
                    }
                    .header {
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0 0 10px 0;
                        color: var(--vscode-editor-foreground);
                        font-size: 1.5em;
                    }
                    .header p {
                        margin: 0;
                        color: var(--vscode-descriptionForeground);
                        font-size: 0.9em;
                    }
                    .content {
                        white-space: pre-wrap;
                        font-family: var(--vscode-editor-font-family);
                    }
                    .section {
                        margin-bottom: 20px;
                    }
                    .section h2 {
                        color: var(--vscode-textLink-foreground);
                        border-bottom: 1px solid var(--vscode-textLink-foreground);
                        padding-bottom: 5px;
                        margin-top: 30px;
                        margin-bottom: 10px;
                    }
                    .section h3 {
                        color: var(--vscode-textLink-foreground);
                        margin-top: 20px;
                        margin-bottom: 5px;
                    }
                    .highlight {
                        background-color: var(--vscode-editor-selectionBackground);
                        padding: 2px 4px;
                        border-radius: 3px;
                    }
                    .warning {
                        color: var(--vscode-notificationsWarningIcon-foreground);
                    }
                    .error {
                        color: var(--vscode-notificationsErrorIcon-foreground);
                    }
                    .success {
                        color: var(--vscode-notificationsInfoIcon-foreground);
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔍 Code Review Report</h1>
                    <p>Analysis of ${selection.isEmpty ? 'entire file' : 'selected code'} (${languageId})</p>
                </div>
                <div class="content">${formatReviewResponse(response)}</div>
            </body>
            </html>
        `;

        // Track usage
        await trackUsage('codeReview');

        vscode.window.showInformationMessage('Code review completed!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Provide more specific error messages and recovery options
        if (errorMessage.includes('API key')) {
            const choice = await vscode.window.showErrorMessage(
                'API key error. Would you like to login again?',
                'Login',
                'Cancel'
            );
            if (choice === 'Login') {
                await vscode.commands.executeCommand('extension.login');
                return;
            }
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            vscode.window.showErrorMessage('API rate limit exceeded. Please try again in a moment.');
        } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
            vscode.window.showErrorMessage('Network error. Please check your internet connection and try again.');
        } else {
            vscode.window.showErrorMessage(`Code review failed: ${errorMessage}`);
        }
    }
}

function formatReviewResponse(response: string): string {
    // Basic formatting to improve readability
    return response
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="highlight">$1</code>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^- /gm, '• ')
        .replace(/^(\d+)\. /gm, '$1. ')
        .replace(/\n\n/g, '</div><div class="section">');
}