import * as vscode from 'vscode';
import { callAI, getApiKey } from '../services/apiService';
import { trackUsage } from '../services/usageService';

export async function fixCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
        vscode.window.showErrorMessage('Please select code to fix');
        return;
    }

    try {
        const apiKey = await getApiKey();

        const response = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Fixing Code',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Analyzing code...' });

            progress.report({ increment: 30, message: 'Sending to AI service...' });

            const result = await callAI(
                `Fix any bugs or issues in the following code:\n\n${selectedText}\n\nReturn only the fixed code, no explanation.`,
                apiKey
            );

            progress.report({ increment: 70, message: 'Processing fixes...' });

            return result;
        });

        editor.edit(editBuilder => {
            editBuilder.replace(selection, response);
        });

        // Track usage
        await trackUsage('fixCode');

        vscode.window.showInformationMessage('Code fixed successfully!');
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
            vscode.window.showErrorMessage(`Code fixing failed: ${errorMessage}`);
        }
    }
}
