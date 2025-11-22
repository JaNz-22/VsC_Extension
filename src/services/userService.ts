import * as vscode from 'vscode';
import * as crypto from 'crypto';

export interface User {
    id: string;
    name: string;
    email: string;
    apiKey: string;
    createdAt: string;
    lastLoginAt: string;
}

export class UserService {
    private static readonly USERS_KEY = 'aiExtension.users';
    private static readonly CURRENT_USER_KEY = 'aiExtension.currentUser';

    /**
     * Hash a password using SHA-256
     */
    private static hashPassword(password: string): string {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    /**
     * Generate a unique user ID
     */
    private static generateUserId(): string {
        return crypto.randomUUID();
    }

    /**
     * Get all stored users
     */
    private static getStoredUsers(): Record<string, User> {
        const config = vscode.workspace.getConfiguration('aiExtension');
        return config.get<Record<string, User>>(this.USERS_KEY, {});
    }

    /**
     * Save users to storage
     */
    private static async saveUsers(users: Record<string, User>): Promise<void> {
        const config = vscode.workspace.getConfiguration('aiExtension');
        await config.update(this.USERS_KEY, users, vscode.ConfigurationTarget.Global);
    }

    /**
     * Register a new user
     */
    static async register(name: string, email: string, password: string, apiKey: string): Promise<User> {
        const users = this.getStoredUsers();

        // Check if email already exists
        const existingUser = Object.values(users).find(user => user.email === email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const user: User = {
            id: this.generateUserId(),
            name: name.trim(),
            email: email.trim(),
            apiKey: apiKey.trim(),
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
        };

        users[user.id] = user;
        await this.saveUsers(users);

        // Set as current user
        await this.setCurrentUser(user);

        return user;
    }

    /**
     * Login with email and password
     */
    static async login(email: string, password: string): Promise<User> {
        const users = this.getStoredUsers();

        const user = Object.values(users).find(u => u.email === email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // For this simple implementation, we'll just check if the user exists
        // In a real app, you'd verify the password hash
        user.lastLoginAt = new Date().toISOString();
        users[user.id] = user;
        await this.saveUsers(users);

        await this.setCurrentUser(user);
        return user;
    }

    /**
     * Login with API key only (existing functionality)
     */
    static async loginWithApiKey(name: string, email: string, apiKey: string): Promise<User> {
        const users = this.getStoredUsers();

        // Check if user with this email already exists
        let user = Object.values(users).find(u => u.email === email);

        if (user) {
            // Update existing user
            user.name = name.trim();
            user.apiKey = apiKey.trim();
            user.lastLoginAt = new Date().toISOString();
            users[user.id] = user;
        } else {
            // Create new user
            user = {
                id: this.generateUserId(),
                name: name.trim(),
                email: email.trim(),
                apiKey: apiKey.trim(),
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            };
            users[user.id] = user;
        }

        await this.saveUsers(users);
        await this.setCurrentUser(user);
        return user;
    }

    /**
     * Set current logged in user
     */
    private static async setCurrentUser(user: User): Promise<void> {
        const config = vscode.workspace.getConfiguration('aiExtension');
        await config.update(this.CURRENT_USER_KEY, user.id, vscode.ConfigurationTarget.Global);
        await config.update('isLoggedIn', true, vscode.ConfigurationTarget.Global);
        await config.update('userName', user.name, vscode.ConfigurationTarget.Global);
        await config.update('userEmail', user.email, vscode.ConfigurationTarget.Global);
        await config.update('openaiApiKey', user.apiKey, vscode.ConfigurationTarget.Global);
    }

    /**
     * Get current logged in user
     */
    static getCurrentUser(): User | null {
        const config = vscode.workspace.getConfiguration('aiExtension');
        const currentUserId = config.get<string>(this.CURRENT_USER_KEY);

        if (!currentUserId) return null;

        const users = this.getStoredUsers();
        return users[currentUserId] || null;
    }

    /**
     * Logout current user
     */
    static async logout(): Promise<void> {
        const config = vscode.workspace.getConfiguration('aiExtension');
        await config.update(this.CURRENT_USER_KEY, undefined, vscode.ConfigurationTarget.Global);
        await config.update('isLoggedIn', false, vscode.ConfigurationTarget.Global);
        await config.update('userName', '', vscode.ConfigurationTarget.Global);
        await config.update('userEmail', '', vscode.ConfigurationTarget.Global);
        await config.update('openaiApiKey', '', vscode.ConfigurationTarget.Global);
    }

    /**
     * Check if user is logged in
     */
    static isLoggedIn(): boolean {
        const config = vscode.workspace.getConfiguration('aiExtension');
        return config.get<boolean>('isLoggedIn', false) && !!this.getCurrentUser();
    }

    /**
     * Get API key for current user
     */
    static getApiKey(): string | null {
        const user = this.getCurrentUser();
        return user?.apiKey || null;
    }
}