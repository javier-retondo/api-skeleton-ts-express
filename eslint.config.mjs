import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser';

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.strict, {
   plugins: { tseslint },
   languageOptions: {
      parser,
      parserOptions: {
         project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
         tsconfigRootDir: import.meta.dirname,
      },
   },
   ignores: ['tests/**/*.ts'],
   rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
   },
});
