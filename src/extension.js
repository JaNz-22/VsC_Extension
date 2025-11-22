const vscode = require('vscode');
const { helloCommand } = require('./commands/helloCommand');
const { generateCode } = require('./commands/generateCode');
const { fixCode } = require('./commands/fixCode');
const { checkErrors } = require('./commands/checkErrors');
const { codeReview } = require('./commands/codeReview');
const { loginCommand } = require('./commands/loginCommand');
const { dashboard } = require('./commands/dashboard');
const { chat } = require('./commands/chat');

function activate(context) {
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

function deactivate() {}

module.exports = {
    activate,
    deactivate
};