import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1867C0',
            secondary: '#5CBBF6',
            accent: '#4CAF50',
          },
        },
        dark: {
          colors: {
            primary: '#2196F3',
            secondary: '#424242',
            accent: '#FF4081',
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
