import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
    test: {
        globals: true,
        root: './',
        include: ['**/*.spec.ts'],
        exclude: ['**/*.e2e-spec.ts', 'node_modules', 'dist'],
        setupFiles: ['./test-setup.ts'],
        environment: 'node',
    },
    plugins: [
        // This is required to build the test files with SWC
        swc.vite({
            // Explicitly set the module type to avoid errors. This is usually required for NestJS.
            module: { type: 'es6' },
        }),
    ],
});
