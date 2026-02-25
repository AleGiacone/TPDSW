// import type {Config} from 'jest';

// const config: Config = {
//   preset: 'ts-jest/presets/default-esm',
//   testEnvironment: 'node',
//   extensionsToTreatAsEsm: ['.ts'],
  
//   moduleNameMapper: {
//     '^(\\.{1,2}/.*)\\.js$': '$1',
//   },
  
//   transform: {
//     '^.+\\.ts$': [
//       'ts-jest',
//       {
//         useESM: true,
//         tsconfig: {
//           module: 'ES2022',
//           target: 'ES2022',
//           moduleResolution: 'node',
//         },
//       },
//     ],
//   },

//   roots: ['<rootDir>/src'],
//   testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
//   testPathIgnorePatterns: ['/node_modules/', '/dist/'],
//   moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  
//   clearMocks: true,
//   verbose: true,
//   forceExit: true,
// };

// export default config;

export default {
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    preset: 'ts-jest/presets/default-esm',
    transform: {
      '^.+\\.ts$': [
        'ts-jest',
        {
          useESM: true,
          tsconfig: {
            target: 'ESNext',
            module: 'ESNext',
            moduleResolution: 'bundler',
            esModuleInterop: true,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            lib: ['ESNext']
          },
        },
      ],
    },
    testMatch: ["**/**/*.test.ts"],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    roots: ['<rootDir>/src'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
}