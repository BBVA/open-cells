module.exports = {
  extends: [require.resolve('@open-wc/eslint-config'), require.resolve('eslint-config-prettier')],
  overrides: [
    {
      files: ['**/test/**/*.js', '**/*.config.js'],
      rules: {
        'no-console': 'off',
        'no-unused-expressions': 'off',
        'class-methods-use-this': 'off',
        'max-classes-per-file': 'off',
        'import/no-extraneous-dependencies': 'off', // we moved all devDependencies to root
      },
    },
  ],
};
