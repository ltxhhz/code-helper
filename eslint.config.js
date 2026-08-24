// eslint.config.js
import tseslint from 'typescript-eslint';

export default tseslint.config({
  // 可选：指定要检查的文件（不指定则默认所有文件）
  // files: ['**/*.ts', '**/*.tsx'],

  // 忽略模式（对应原 ignorePatterns）
  ignores: ['out', 'dist', '**/*.d.ts'],

  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: 6,
      sourceType: 'module',
    },
  },

  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },

  rules: {
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'import',
        format: ['camelCase', 'PascalCase'],
      },
    ],
    '@typescript-eslint/semi': 'off',
    'eqeqeq': 'warn',
    'no-throw-literal': 'warn',
  },
});