/** @type {import('jest').Config} */
const config = {
  // Environnement de test
  testEnvironment: 'node',
  
  // Transformer TypeScript avec ts-jest
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ESNext',
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  
  // Extensions à traiter
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Pattern des fichiers de test
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  
  // Ignorer ces dossiers
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  
  // Alias de modules (correspondance avec tsconfig)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Setup avant les tests
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  // Coverage
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/api/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  
  // Timeout plus long pour les tests async
  testTimeout: 10000,
  
  // Reporter verbose
  verbose: true,
};

module.exports = config;
