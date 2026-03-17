import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: false,

  runtimeConfig: {
    imaginCustomer: 'hrjavascript-mastery',
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  build: {
    transpile: ['vuetify'],
  },

  vite: {
    plugins: [
      vuetify({ autoImport: true }),
    ],
  },

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
  ],

  compatibilityDate: '2025-01-01',
})
