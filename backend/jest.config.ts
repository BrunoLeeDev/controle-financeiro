import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['\\.integration\\.test\\.ts$'],
  collectCoverageFrom: [
    'src/application/**/*.ts',
    'src/infrastructure/services/**/*.ts',
    'src/infrastructure/export/**/*.ts',
    '!**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 50,
      lines: 60,
      statements: 60,
    },
  },
};

export default config;
