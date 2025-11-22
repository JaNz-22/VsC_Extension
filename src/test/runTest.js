;
const path = require('path');
const { runTests  } = require('vscode-test');

async function run() {
    try {
        // The path to the extension test folder
        const extensionPath = path.resolve(__dirname, '../..');
        // The path to the test file
        const testPath = path.resolve(extensionPath, 'src/test/suite/extension.test.ts');

        // Run the tests
        await runTests({
            extensionDevelopmentPath: extensionPath,
            extensionTestsPath: testPath,
            version: '1.60.0'
        });
    } catch {
        console.error('Failed to run tests');
        process.exit(1);
    }
}

run();