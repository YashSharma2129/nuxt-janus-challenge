// nuxt.config.ts
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
      '@nuxt/ui',
      '@nuxtjs/tailwindcss'
    ],
    ui: {
      global: true,
      icons: ['heroicons']
    },
    css: ['~/assets/css/main.css'],
    typescript: {
      typeCheck: false
    },
    ssr: false, // Disable SSR for WebRTC compatibility
    nitro: {
      experimental: {
        wasm: true
      }
    },
    runtimeConfig: {
      public: {
        janusUrl: process.env.JANUS_URL || 'wss://janus1.januscaler.com/janus/ws'
      }
    }
  })