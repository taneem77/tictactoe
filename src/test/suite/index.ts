import * as path from 'path';
import Mocha from 'mocha';
import glob from 'glob';

/**
 * Run all Mocha tests in the project.
 * @returns A promise that resolves if all tests pass, or rejects with an error if any fail.
 */
export function run(): Promise<void> {
    // Create a Mocha instance
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
    });

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise((resolve, reject) => {
        // Find all test files
        glob('**/*.test.js', { cwd: testsRoot }, (err: Error | null, files: string[]) => {
            if (err) {
                return reject(err);
            }

            // Add each test file to Mocha
            files.forEach((file: string) => {
                const filePath = path.resolve(testsRoot, file);
                mocha.addFile(filePath);
            });

            try {
                // Run the tests
                mocha.run((failures: number) => {
                    if (failures > 0) {
                        reject(new Error(`${failures} test(s) failed.`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                console.error('Error running tests:', err);
                reject(err as Error);
            }
        });
    });
}
