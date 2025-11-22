import * as vscode from 'vscode';
import { callAI, getApiKey } from '../services/apiService';
import { trackUsage } from '../services/usageService';

export async function generateCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor');
        return;
    }

    const prompt = await vscode.window.showInputBox({
        prompt: 'Describe the code you want to generate',
        placeHolder: 'e.g., Create a function to reverse a string'
    });

    if (!prompt) {
        return;
    }

    try {
        const apiKey = await getApiKey();

        const response = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Generating Code',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Preparing request...' });

            progress.report({ increment: 30, message: 'Sending to AI service...' });

            const result = await callAI(
                `Generate the following code:\n\n${prompt}\n\nReturn only the code, no explanation.`,
                apiKey
            );

            progress.report({ increment: 70, message: 'Processing response...' });

            return result;
        });

        editor.edit(editBuilder => {
            const position = editor.selection.active;
            editBuilder.insert(position, response);
        });

        // Track usage
        await trackUsage('generateCode');

        vscode.window.showInformationMessage('Code generated successfully!');
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
            vscode.window.showErrorMessage(`Code generation failed: ${errorMessage}`);
        }
    }
}
