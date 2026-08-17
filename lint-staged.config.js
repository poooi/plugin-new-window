module.exports = {
  '*.{ts,tsx,js}': ['eslint --fix', 'git add'],
  '*.md': ['prettier --write', 'git add'],
}
