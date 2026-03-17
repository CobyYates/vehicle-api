<template>
  <div>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>My App</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ themeIcon }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list nav>
        <v-list-item prepend-icon="mdi-home" title="Home" to="/" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <slot />
      </v-container>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

const drawer = ref(false)
const theme = useTheme()

const themeIcon = computed(() =>
  theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'
)

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>
