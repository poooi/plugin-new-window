module.exports = {
  '*.{es,js}': ['eslint --fix', 'stylelint --config .stylelintrc.styled.js', 'git add'],
  '*.md': ['prettier --write', 'git add'],
}
