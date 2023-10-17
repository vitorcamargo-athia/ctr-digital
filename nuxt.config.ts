// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt-alt/proxy',
    'nuxt-icon'
  ],
  css: [
    'bootstrap/dist/css/bootstrap.css'
  ],
  proxy: {
    proxies: {
      '/api': {
        target: 'https://sandbox.clicksign.com/api/v1',
        //target: 'https://app.clicksign.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
