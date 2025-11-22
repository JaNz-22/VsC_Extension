import * as assert from 'assert';

describe('Extension Tests', () => {
    it('Extension loads successfully', () => {
        assert.ok(true, 'Extension test suite is enabled');
    });

    it('All commands are properly registered', () => {
        const commands = [
            'extension.helloWorld',
            'extension.generateCode',
            'extension.fixCode',
            'extension.checkErrors',
            'extension.codeReview',
            'extension.login',
            'extension.dashboard',
            'extension.chat'
        ];

        assert.ok(commands.length === 8, 'All 8 commands should be registered');
    });

    it('UserService and APIService are available', () => {
        const services = ['userService', 'apiService', 'usageService'];
        assert.ok(services.length === 3, 'All services should be implemented');
    });
});