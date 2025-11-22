import * as vscode from 'vscode';

export function helloCommand() {
    vscode.window.showInformationMessage('Hello from your VS Code extension!');
}