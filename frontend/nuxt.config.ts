export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  vite: {
    server: {
      watch: { usePolling: true },
    },
  },
  runtimeConfig: {
    notificationUrl: process.env.NUXT_NOTIFICATION_URL || 'http://localhost:8081',
    public: {
      uploadUrl: process.env.NUXT_PUBLIC_UPLOAD_URL || 'http://localhost:8080',
      storageUrl: process.env.NUXT_PUBLIC_STORAGE_URL || 'http://localhost:9000',
    },
  },
})
