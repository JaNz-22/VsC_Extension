const assert = require('assert');
const sinon = require('sinon');
const vscode = require('vscode');
const { helloCommand  } = require('../../commands/helloCommand');
const { generateCode  } = require('../../commands/generateCode');
const { fixCode  } = require('../../commands/fixCode');
const { checkErrors  } = require('../../commands/checkErrors');
const { loginCommand  } = require('../../commands/loginCommand');
const { callAI, getApiKey  } = require('../../services/apiService');

suite('Extension Tests', () => {
    let sandbox;
    let mockWindow;
    let mockWorkspace;

    setup(() => {
        sandbox = sinon.createSandbox();
        mockWindow = sandbox.stub(vscode.window);
        mockWorkspace = sandbox.stub(vscode.workspace);

        // Mock vscode modules
        sandbox.stub(vscode, 'window').value(mockWindow);
        sandbox.stub(vscode, 'workspace').value(mockWorkspace);
    });

    teardown(() => {
        sandbox.restore();
    });

    suite('helloCommand', () => {
        test('should display greeting message', () => {
            mockWindow.showInformationMessage.resolves();

            helloCommand();

            assert.ok(mockWindow.showInformationMessage.calledOnceWith('Hello from your VS Code extension!'));
        });
    });

    suite('generateCode', () => {
        test('should show error when no active editor', async () => {
            mockWindow.activeTextEditor = undefined;
            mockWindow.showErrorMessage.resolves();

            await generateCode();

            assert.ok(mockWindow.showErrorMessage.calledOnceWith('No active text editor'));
        });

        test('should cancel when no prompt provided', async () => {
            const mockEditor = {
                selection: { active: { line: 0, character: 0 } },
                edit: sandbox.stub().resolves()
            };
            mockWindow.activeTextEditor = mockEditor;
            mockWindow.showInputBox.resolves(undefined);

            await generateCode();

            assert.ok(mockWindow.showInputBox.calledOnce);
            assert.ok(!mockEditor.edit.called);
        });

        test('should generate and insert code successfully', async () => {
            const mockEditor = {
                selection: { active: { line: 0, character: 0 } },
                edit: sandbox.stub().resolves()
            };
            mockWindow.activeTextEditor = mockEditor;
            mockWindow.showInputBox.resolves('Create a function to add two numbers');
            mockWindow.showInformationMessage.resolves();

            // Mock API service
            sandbox.stub(require('../../services/apiService'), 'getApiKey').resolves('test-key');
            sandbox.stub(require('../../services/apiService'), 'callAI').resolves('function add(a, b) { return a + b; }');

            await generateCode();

            assert.ok(mockWindow.showInputBox.calledOnce);
            assert.ok(mockWindow.showInformationMessage.calledWith('Generating code...'));
            assert.ok(mockEditor.edit.calledOnce);
            assert.ok(mockWindow.showInformationMessage.calledWith('Code generated successfully!'));
        });

        test('should handle API errors gracefully', async () => {
            const mockEditor = {
                selection: { active: { line: 0, character: 0 } },
                edit: sandbox.stub().resolves()
            };
            mockWindow.activeTextEditor = mockEditor;
            mockWindow.showInputBox.resolves('Create a function');
            mockWindow.showErrorMessage.resolves();

            sandbox.stub(require('../../services/apiService'), 'getApiKey').resolves('test-key');
            sandbox.stub(require('../../services/apiService'), 'callAI').rejects(new Error('API Error'));

            await generateCode();

            assert.ok(mockWindow.showErrorMessage.calledWith('Error: API Error'));
        });
    });

    suite('fixCode', () => {
        test('should show error when no active editor', async () => {
            mockWindow.activeTextEditor = undefined;
            mockWindow.showErrorMessage.resolves();

            await fixCode();

            assert.ok(mockWindow.showErrorMessage.calledOnceWith('No active text editor'));
        });

        test('should show error when no code selected', async () => {
            const mockEditor = {
                selection: { isEmpty: true },
                document: { getText: sandbox.stub().returns('') }
            };
            mockWindow.activeTextEditor = mockEditor;
            mockWindow.showErrorMessage.resolves();

            await fixCode();

            assert.ok(mockWindow.showErrorMessage.calledOnceWith('Please select code to fix'));
        });

        test('should fix selected code successfully', async () => {
            const mockEditor = {
                selection: { isEmpty: false },
                document: { getText: sandbox.stub().returns('buggy code') },
                edit: sandbox.stub().resolves()
            };
            mockWindow.activeTextEditor = mockEditor;
            mockWindow.showInformationMessage.resolves();

            sandbox.stub(require('../../services/apiService'), 'getApiKey').resolves('test-key');
            sandbox.stub(require('../../services/apiService'), 'callAI').resolves('fixed code');

            await fixCode();

            assert.ok(mockWindow.showInformationMessage.calledWith('Fixing code...'));
            assert.ok(mockEditor.edit.calledOnce);
            assert.ok(mockWindow.showInformationMessage.calledWith('Code fixed successfully!'));
        });
    });

    suite('checkErrors', () => {
        test('should show error when no active editor', async () => {
            mockWindow.activeTextEditor = undefined;
            mockWindow.showErrorMessage.resolves();

            await checkErrors();

            assert.ok(mockWindow.showErrorMessage.calledOnceWith('No active text editor'));
        });

        test('should create webview panel with error report', async () => {
            const mockEditor = {
                selection: { isEmpty: true },
                document: { getText: sandbox.stub().returns('test code') }
            };
            const mockPanel = {
                webview: { html: '' }
            };
            mockWindow.activeTextEditor = mockEditor;
            mockWindow.createWebviewPanel.returns(mockPanel);
            mockWindow.showInformationMessage.resolves();

            sandbox.stub(require('../../services/apiService'), 'getApiKey').resolves('test-key');
            sandbox.stub(require('../../services/apiService'), 'callAI').resolves('No errors found');

            await checkErrors();

            assert.ok(mockWindow.createWebviewPanel.calledOnce);
            assert.ok(mockPanel.webview.html.includes('Error Check Report'));
        });
    });

    suite('loginCommand', () => {
        test('should create login webview panel', () => {
            const mockPanel = {
                webview: { html: '', onDidReceiveMessage: sandbox.stub() }
            };
            mockWindow.createWebviewPanel.returns(mockPanel);

            loginCommand();

            assert.ok(mockWindow.createWebviewPanel.calledOnceWith(
                'aiLogin',
                'AI Service Login',
                sinon.match.any,
                sinon.match.any
            ));
            assert.ok(mockPanel.webview.html.includes('AI Service Login'));
        });
    });

    suite('apiService', () => {
        test('callAI should make correct API request', async () => {
            const axiosStub = sandbox.stub(require('axios'));
            axiosStub.post.resolves({
                data: {
                    choices: [{ message: { content: 'AI response' } }]
                }
            });

            const result = await callAI('test prompt', 'test-key');

            assert.strictEqual(result, 'AI response');
            assert.ok(axiosStub.post.calledOnce);
            assert.ok(axiosStub.post.calledWith(
                'https://api.openai.com/v1/chat/completions',
                sinon.match({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: 'test prompt' }],
                    max_tokens: 2000
                }),
                sinon.match({
                    headers: {
                        'Authorization': 'Bearer test-key',
                        'Content-Type': 'application/json'
                    }
                })
            ));
        });

        test('getApiKey should return stored key when logged in', async () => {
            const mockConfig = {
                get: sandbox.stub()
            };
            mockConfig.get.withArgs('isLoggedIn').returns(true);
            mockConfig.get.withArgs('openaiApiKey').returns('stored-key');
            mockWorkspace.getConfiguration.returns(mockConfig as any);

            const result = await getApiKey();

            assert.ok(result === 'stored-key');
        });

        test('getApiKey should prompt login when not logged in', async () => {
            const mockConfig = {
                get: sandbox.stub(),
                update: sandbox.stub().resolves()
            };
            mockConfig.get.withArgs('isLoggedIn').returns(false);
            mockConfig.get.withArgs('openaiApiKey').returns(undefined);
            mockWorkspace.getConfiguration.returns(mockConfig as any);
            mockWindow.showInformationMessage.resolves({ title: 'Login' } as any);

            // Mock the login command execution
            sandbox.stub(vscode.commands, 'executeCommand').resolves();

            // Mock updated config after login
            const updatedConfig = {
                get: sandbox.stub()
            };
            updatedConfig.get.withArgs('isLoggedIn').returns(true);
            updatedConfig.get.withArgs('openaiApiKey').returns('new-key');
            mockWorkspace.getConfiguration.onSecondCall().returns(updatedConfig as any);

            const result = await getApiKey();

            assert.ok(result === 'new-key');
        });
    });
});