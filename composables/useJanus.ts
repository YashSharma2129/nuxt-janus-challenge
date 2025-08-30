// composables/useJanus.ts
import { ref, readonly, onUnmounted } from 'vue'
import type { JanusSession, JanusPlugin, JanusConfig } from '~/types/janus'

export const useJanus = () => {
  const janusInstance = ref<any>(null)
  const session = ref<JanusSession | null>(null)
  const isInitialized = ref(false)
  const isConnected = ref(false)
  const error = ref<string | null>(null)

  const config = useRuntimeConfig()

  const initJanus = async (): Promise<boolean> => {
    try {
      if (process.server) return false

      // Import JanusJs from typed_janus_js
      const { JanusJs } = await import('typed_janus_js')

      // Initialize JanusJs
      janusInstance.value = new JanusJs({
        server: config.public.janusUrl,
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })

      // Initialize the Janus instance
      await janusInstance.value.init({
        debug: process.dev ? 'all' : false
      })

      isInitialized.value = true
      console.log('Janus initialized successfully')
      return true
    } catch (err) {
      error.value = `Failed to initialize Janus: ${err}`
      console.error('Janus initialization error:', err)
      return false
    }
  }

  const connect = async (): Promise<JanusSession | null> => {
    if (!isInitialized.value) {
      const initialized = await initJanus()
      if (!initialized) return null
    }

    try {
      // Create a session using JanusJs
      const sessionObj = await janusInstance.value.createSession()
      session.value = sessionObj
      isConnected.value = true
      error.value = null
      console.log('Connected to Janus server')
      return sessionObj
    } catch (err) {
      error.value = `Failed to connect: ${err}`
      console.error('Janus connection error:', err)
      return null
    }
  }

  const attachPlugin = async (pluginClass: any, options?: any): Promise<JanusPlugin | null> => {
    if (!session.value) {
      error.value = 'No active Janus session'
      return null
    }

    try {
      // JanusJs session attach method with class constructor
      const plugin = await session.value.attach(pluginClass, options || {})
      return plugin
    } catch (err) {
      error.value = `Failed to attach plugin: ${err}`
      console.error('Plugin attach error:', err)
      return null
    }
  }

  const disconnect = async () => {
    try {
      if (session.value) {
        // Clean up session
        session.value = null
      }
      if (janusInstance.value) {
        // Clean up JanusJs instance if needed
        janusInstance.value = null
      }
      isConnected.value = false
      isInitialized.value = false
      error.value = null
      console.log('Disconnected from Janus')
    } catch (err) {
      console.error('Disconnect error:', err)
    }
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    janusInstance: readonly(janusInstance),
    session: readonly(session),
    isInitialized: readonly(isInitialized),
    isConnected: readonly(isConnected),
    error: readonly(error),
    initJanus,
    connect,
    attachPlugin,
    disconnect
  }
}