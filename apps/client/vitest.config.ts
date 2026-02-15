import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [angular()],
    test: {
        root: __dirname,
        globals: true,
        environment: 'jsdom',
        setupFiles: [resolve(__dirname, 'src/test-setup.ts')],
        include: ['src/**/*.spec.ts'],
        reporters: ['default'],
    },
});
