import axios from 'axios';
import * as vscode from 'vscode';
import { UserService } from './userService';

export async function callAI(prompt: string, apiKey: string): Promise<string> {
    try {
        // Get configuration settings
        const config = vscode.workspace.getConfiguration('aiExtension');
        const model = config.get<string>('model', 'gpt-3.5-turbo');
        const temperature = config.get<number>('temperature', 0.7);
        const maxTokens = config.get<number>('maxTokens', 2000);

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: maxTokens,
                temperature: temperature
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = response.data.choices[0].message.content;
        return result;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const errorData = error.response?.data;

            if (status === 401) {
                throw new Error('Invalid API key. Please check your OpenAI API key.');
            } else if (status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (status === 400) {
                throw new Error('Invalid request. Please check your input.');
            } else if (status && status >= 500) {
                throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
            } else {
                throw new Error(`API Error: ${errorData?.error?.message || error.message}`);
            }
        } else if (error instanceof Error) {
            if (error.message.includes('timeout')) {
                throw new Error('Request timed out. Please check your internet connection.');
            } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
        throw new Error('An unexpected error occurred.');
    }
}

export async function getApiKey(): Promise<string> {
    const apiKey = UserService.getApiKey();

    if (!apiKey) {
        const loginChoice = await vscode.window.showInformationMessage(
            'You need to login to use AI features. Would you like to login now?',
            'Login',
            'Cancel'
        );

        if (loginChoice === 'Login') {
            await vscode.commands.executeCommand('extension.login');
            // Re-check after login
            const updatedApiKey = UserService.getApiKey();

            if (updatedApiKey) {
                // Validate the API key format
                if (!updatedApiKey.startsWith('sk-')) {
                    throw new Error('Invalid API key format. OpenAI API keys should start with "sk-".');
                }
                return updatedApiKey;
            } else {
                throw new Error('Login failed or was cancelled. Please try again.');
            }
        } else {
            throw new Error('Login required to use AI features. Please login to continue.');
        }
    }

    return apiKey;
}

export function isLoggedIn(): boolean {
    return UserService.isLoggedIn();
}
