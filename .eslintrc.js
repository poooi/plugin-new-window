module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'poi-plugin',
    'prettier',
    'prettier/react',
  ],
  plugins: [
    'import',
    'react',
    'prettier',
  ],
  parser: 'babel-eslint',
  globals: {
    WindowManager: true,
    '$': true,
  },
  rules: {
    'react/no-find-dom-node': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'prettier/prettier': 'error',
  },
}
