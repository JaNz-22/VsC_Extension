import * as vscode from 'vscode';
import { helloCommand } from './commands/helloCommand';
import { generateCode } from './commands/generateCode';
import { fixCode } from './commands/fixCode';
import { checkErrors } from './commands/checkErrors';
import { codeReview } from './commands/codeReview';
import { loginCommand } from './commands/loginCommand';
import { dashboard } from './commands/dashboard';
import { chat } from './commands/chat';

export function activate(context: vscode.ExtensionContext) {
    const helloCommandDisposable = vscode.commands.registerCommand('extension.helloWorld', helloCommand);
    const generateCodeDisposable = vscode.commands.registerCommand('extension.generateCode', generateCode);
    const fixCodeDisposable = vscode.commands.registerCommand('extension.fixCode', fixCode);
    const checkErrorsDisposable = vscode.commands.registerCommand('extension.checkErrors', checkErrors);
    const codeReviewDisposable = vscode.commands.registerCommand('extension.codeReview', codeReview);
    const loginCommandDisposable = vscode.commands.registerCommand('extension.login', loginCommand);
    const dashboardDisposable = vscode.commands.registerCommand('extension.dashboard', dashboard);
    const chatDisposable = vscode.commands.registerCommand('extension.chat', chat);

    context.subscriptions.push(helloCommandDisposable);
    context.subscriptions.push(generateCodeDisposable);
    context.subscriptions.push(fixCodeDisposable);
    context.subscriptions.push(checkErrorsDisposable);
    context.subscriptions.push(codeReviewDisposable);
    context.subscriptions.push(loginCommandDisposable);
    context.subscriptions.push(dashboardDisposable);
    context.subscriptions.push(chatDisposable);
}

export function deactivate() {}