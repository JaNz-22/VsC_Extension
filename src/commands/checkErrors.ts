import * as vscode from 'vscode';
import { callAI, getApiKey } from '../services/apiService';
import { trackUsage } from '../services/usageService';

export async function checkErrors() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection) || editor.document.getText();

    if (!selectedText) {
        vscode.window.showErrorMessage('No code to check');
        return;
    }

    try {
        const apiKey = await getApiKey();

        const response = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Checking Errors',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Analyzing code...' });

            progress.report({ increment: 30, message: 'Sending to AI service...' });

            const result = await callAI(
                `Analyze the following code for potential errors, bugs, and issues:\n\n${selectedText}\n\nProvide a detailed report of any errors found.`,
                apiKey
            );

            progress.report({ increment: 70, message: 'Generating report...' });

            return result;
        });

        const panel = vscode.window.createWebviewPanel(
            'errorReport',
            'Error Check Report',
            vscode.ViewColumn.Beside,
            {}
        );

        panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        line-height: 1.6;
                    }
                    h1 { color: #333; }
                    pre {
                        background-color: #f4f4f4;
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                    }
                </style>
            </head>
            <body>
                <h1>Error Check Report</h1>
                <div>${response.replace(/\n/g, '<br>')}</div>
            </body>
            </html>
        `;

        // Track usage
        await trackUsage('checkErrors');
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
            vscode.window.showErrorMessage(`Error checking failed: ${errorMessage}`);
        }
    }
}
