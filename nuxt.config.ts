// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt-alt/proxy'
  ],
  css: [
    'bootstrap/dist/css/bootstrap.css'
  ],
  proxy: {
    proxies: {
      '/api': {
        target: 'https://sandbox.clicksign.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
