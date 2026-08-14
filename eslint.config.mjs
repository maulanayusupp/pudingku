// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  },
}).append({
  ignores: ['public/**', '.output/**', '.nuxt/**', 'dist/**'],
})
