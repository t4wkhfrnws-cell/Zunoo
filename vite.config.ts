/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Zuuno build configuration.
// A dev proxy fronts the ClinicalTrials.gov API so the chatbot-personalized
// trial search works in local development regardless of browser CORS policy.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/ctgov': {
        target: 'https://clinicaltrials.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ctgov/, '/api/v2'),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
