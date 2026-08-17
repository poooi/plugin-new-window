const tsExtensions = ['.ts', '.tsx']

module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'poi-plugin',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'import', 'react', 'react-hooks', 'prettier'],
  globals: {
    config: 'readonly',
    $: 'readonly',
    $$: 'readonly',
    PoiWindowManager: 'readonly',
    PoiBrowserWindow: 'readonly',
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    // the base rule reports type-only identifiers as unused, the ts-aware one does not
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    'react/prop-types': 'off',
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      // <webview> takes Electron-specific attributes the rule does not know about
      files: ['views/index.tsx'],
      rules: {
        'react/no-unknown-property': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: '18.3.0',
    },
    'import/extensions': tsExtensions,
    'import/parsers': {
      '@typescript-eslint/parser': tsExtensions,
    },
    'import/resolver': {
      node: {
        extensions: tsExtensions,
      },
      typescript: {
        project: './',
      },
    },
  },
  ignorePatterns: ['node_modules', 'shims/**', '*.config.js', '.eslintrc.js', 'webview-preload.js'],
}
