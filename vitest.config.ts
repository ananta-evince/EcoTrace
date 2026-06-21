import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        branches: 76,
        functions: 80,
        statements: 80,
      },
      include: ['src/features/**', 'src/lib/**'],
      exclude: [
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        'src/lib/auth.ts',
        'src/lib/prisma.ts',
        'src/features/auth/components/AuthForms.tsx',
        'src/features/**/components/OnboardingWizard.tsx',
        'src/features/tracking/components/TrackingForm.tsx',
        'src/features/dashboard/components/DonutChart.tsx',
        'src/features/dashboard/components/TrendLine.tsx',
        'src/features/dashboard/components/WeeklyChart.tsx',
        'src/features/dashboard/components/ComparisonGauge.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
