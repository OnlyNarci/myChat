/**
 * Vitest 配置文件
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      '@': path.resolve(__dirname, './app'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/api': path.resolve(__dirname, './api'),
      '@/stores': path.resolve(__dirname, './stores'),
      '@/services': path.resolve(__dirname, './services'),
    },
  },
});