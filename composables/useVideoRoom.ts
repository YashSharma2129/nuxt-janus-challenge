import { ref, nextTick, readonly, computed } from 'vue'
import type { JanusPlugin, Publisher } from '../types/janus'
import { useJanus } from './useJanus'

export const useVideoRoom = () => {
  const plugin = ref<JanusPlugin | null>(null)
  const localStream = ref<MediaStream | null>(null)
  const localVideo = ref<HTMLVideoElement | null>(null)
  const isJoined = ref(false)
  const isPublishing = ref(false)
  const roomId = ref(1234) // Default room
  const publisherId = ref<number | null>(null)
  const publishers = ref<Publisher[]>([])
  const error = ref<string | null>(null)

  const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'publishing' | 'published'>('disconnected')
  const connectionKeepAlive = ref<NodeJS.Timeout | null>(null)

  const isConnectionActive = computed(() => {
    return connectionState.value === 'publishing' || connectionState.value === 'published'
  })

  const { connect, attachPlugin } = useJanus()
  let subscriptions: any[] = []
  let keepAliveInterval: NodeJS.Timeout | null = null

  const startKeepAlive = () => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval)
    }

    keepAliveInterval = setInterval(async () => {
      if (plugin.value && isPublishing.value) {
        try {
          await plugin.value.send({ message: { request: 'keepalive' } })
          console.log('💓 Keep-alive sent to maintain connection')
        } catch (err) {
          console.log('⚠️ Keep-alive error:', err)
        }
      }
    }, 30000)

    console.log('🔄 Keep-alive mechanism started')
  }

  const stopKeepAlive = () => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval)
      keepAliveInterval = null
      console.log('🔄 Keep-alive mechanism stopped')
    }
  }

  const joinRoom = async (): Promise<boolean> => {
    try {
      const session = await connect()
      if (!session) return false

      const { JanusVideoRoomPlugin } = await import('typed_janus_js')

      const videoRoomPlugin = await attachPlugin(JanusVideoRoomPlugin, { opaqueId: `videoroom-${Date.now()}` })
      if (!videoRoomPlugin) return false

      plugin.value = videoRoomPlugin

      const messageSub = plugin.value.onMessage.subscribe(({ message, jsep }) => {
        handleVideoRoomMessage(message, jsep)
      })
      subscriptions.push(messageSub)

      const localTrackSub = plugin.value.onLocalTrack.subscribe((data) => {
        if (!data) return

        const { track, on } = data
        if (on && track && track.kind === 'video') {
          if (!localStream.value) {
            localStream.value = new MediaStream()
          }
          localStream.value.addTrack(track)

          nextTick(() => {
            if (localVideo.value && localStream.value) {
              localVideo.value.srcObject = localStream.value
              localVideo.value.muted = true
            }
          })

          console.log('🎬 Local video track added, media should be flowing now')

          if (isPublishing.value && publisherId.value) {
            console.log('🔄 Media flowing detected, checking publisher status...')
            setTimeout(async () => {
              try {
                if (plugin.value) {
                  const participants = await plugin.value.listParticipants(roomId.value)
                  const ourPublisher = participants.participants?.find((p: any) => p.id === publisherId.value)
                  if (ourPublisher) {
                    console.log('🎯 Publisher status after media flow:', {
                      id: ourPublisher.id,
                      display: ourPublisher.display,
                      publisher: ourPublisher.publisher
                    })
                  }
                }
              } catch (err) {
                console.log('⚠️ Error checking status after media flow:', err)
              }
            }, 1000)
          }
        }
      })
      subscriptions.push(localTrackSub)

      await plugin.value.joinRoomAsPublisher(roomId.value, {
        display: `Publisher_${Date.now()}`
      })

      isJoined.value = true
      return true

    } catch (err) {
      error.value = `Failed to join room: ${err}`
      console.error('Join room error:', err)
      return false
    }
  }

  const publishStream = async (): Promise<boolean> => {
    try {
      if (!plugin.value || !localStream.value) {
        console.log('❌ Cannot publish: plugin or stream not available')
        return false
      }

      console.log('🎥 Starting to publish stream...')
      connectionState.value = 'publishing' // Set state to publishing

      // Get user media stream if not already available
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStream.value = stream
      console.log('📹 Got user media stream:', stream)

      const offer = await plugin.value.createOffer({
        tracks: [
          { type: 'audio', capture: true, recv: false },
          { type: 'video', capture: true, recv: false }
        ]
      })
      console.log('📤 Created offer for publishing:', offer)

      await plugin.value.publishAsPublisher(offer, {
        audiocodec: 'opus',
        videocodec: 'vp8'
      })

      console.log('✅ Successfully called publishAsPublisher')

      console.log('⏳ Waiting for WebRTC negotiation to complete...')

      return true
    } catch (err) {
      error.value = `Failed to publish stream: ${err}`
      console.error('Publish stream error:', err)
      return false
    }
  }

  const registerMountpoint = async (): Promise<boolean> => {
    if (!publisherId.value) {
      error.value = 'No publisher ID available'
      return false
    }

    try {
      const response = await $fetch('/api/mountpoints', {
        method: 'POST',
        body: {
          description: `VideoRoom ${roomId.value} - Publisher ${publisherId.value}`,
          roomId: roomId.value,
          publisherId: publisherId.value
        }
      })

      console.log('Mountpoint registered:', response.data)
      return true
    } catch (err) {
      error.value = `Failed to register mountpoint: ${err}`
      console.error('Register mountpoint error:', err)
      return false
    }
  }

  const handleVideoRoomMessage = async (msg: any, jsep?: any) => {
    console.log('VideoRoom message:', msg)

    if (msg.videoroom === 'joined') {
      isJoined.value = true
      publisherId.value = msg.id || null
      if (msg.publishers) {
        publishers.value = msg.publishers
      }
    } else if (msg.videoroom === 'event') {
      if (msg.publishers) {
        publishers.value = msg.publishers
      }

      // Handle WebRTC negotiation and stream activation
      if (msg.configured === 'ok') {
        // This is the confirmation that our offer was accepted
        console.log('✅ Publisher configured successfully - WebRTC negotiation complete')

        // Now check if we have an active stream and register mountpoint
        if (localStream.value && localStream.value.active) {
          console.log('✅ Local stream is active, registering mountpoint...')
          try {
            await registerMountpoint()
            console.log('✅ Mountpoint registered successfully after WebRTC negotiation')
            isPublishing.value = true
            connectionState.value = 'published' // Set state to published

            startKeepAlive()

            console.log('🔄 Forcing participant list refresh...')
            setTimeout(async () => {
              try {
                if (plugin.value) {
                  const participants = await plugin.value.listParticipants(roomId.value)
                  console.log('📋 Refreshed participants:', participants)

                  const ourPublisher = participants.participants?.find((p: any) => p.id === publisherId.value)
                  if (ourPublisher) {
                    console.log('🔍 Our publisher status:', {
                      id: ourPublisher.id,
                      display: ourPublisher.display,
                      publisher: ourPublisher.publisher
                    })

                    if (ourPublisher.publisher === false) {
                      console.log('⚠️ Publisher status still false, trying to force update...')

                      try {
                        await plugin.value.send({ message: { request: 'keepalive' } })
                        console.log('📤 Sent keepalive message to Janus')

                        setTimeout(async () => {
                          try {
                            const retryParticipants = await plugin.value.listParticipants(roomId.value)
                            const retryPublisher = retryParticipants.participants?.find((p: any) => p.id === publisherId.value)
                            if (retryPublisher) {
                              console.log('🔄 Retry publisher status:', {
                                id: retryPublisher.id,
                                display: retryPublisher.display,
                                publisher: retryPublisher.publisher
                              })
                            }
                          } catch (err) {
                            console.log('⚠️ Error checking retry status:', err)
                          }
                        }, 1000)
                      } catch (err) {
                        console.log('⚠️ Error sending keepalive:', err)
                      }
                    }
                  }
                }
              } catch (err) {
                console.log('⚠️ Error refreshing participants:', err)
              }
            }, 2000)
          } catch (err) {
            console.error('❌ Error registering mountpoint:', err)
          }
        } else {
          console.log('⚠️ Local stream not active after WebRTC negotiation')
        }
      } else if (jsep && jsep.type && jsep.sdp) {
        console.log('📡 Received JSEP:', jsep.type, jsep.sdp ? 'SDP present' : 'No SDP')

        if (jsep.type === 'answer') {
          console.log('📥 Received WebRTC answer, setting remote description...')
          try {
            await plugin.value?.handleRemoteJsep({ jsep })
            console.log('✅ WebRTC connection established successfully')

            if (!isPublishing.value && localStream.value && localStream.value.active) {
              console.log('🎯 WebRTC active, registering mountpoint...')
              try {
                await registerMountpoint()
                console.log('✅ Mountpoint registered after WebRTC establishment')
                isPublishing.value = true

                console.log('🔄 Forcing participant list refresh...')
                setTimeout(async () => {
                  try {
                    if (plugin.value) {
                      const participants = await plugin.value.listParticipants(roomId.value)
                      console.log('📋 Refreshed participants:', participants)
                    }
                  } catch (err) {
                    console.log('⚠️ Error refreshing participants:', err)
                  }
                }, 2000)
              } catch (err) {
                console.error('❌ Error registering mountpoint after JSEP:', err)
              }
            }
          } catch (err) {
            console.error('❌ Error handling JSEP:', err)
          }
        }
      } else if (msg.publishers && msg.publishers.length > 0) {
        console.log('🎥 Publishers are now streaming:', msg.publishers)
        if (!isPublishing.value) {
          isPublishing.value = true
          console.log('🎯 Publisher is now actively streaming')
        }
      } else if (jsep && jsep.type && jsep.sdp) {
        try {
          await plugin.value?.handleRemoteJsep({ jsep })
        } catch (err) {
          console.error('WebRTC error:', err)
        }
      }
    }
  }

  const leaveRoom = async () => {
    try {
      subscriptions.forEach(sub => sub.unsubscribe())
      subscriptions = []

      if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop())
        localStream.value = null
      }

      if (plugin.value) {
        await plugin.value.leave()
        plugin.value = null
      }
      if (publisherId.value) {
        try {
          const existingMountpoints = await $fetch<{ data: any[] }>('/api/mountpoints')
          const mountpoint = existingMountpoints.data.find((mp: any) =>
            mp.publisherId === publisherId.value && mp.roomId === roomId.value
          )
          if (mountpoint) {
            await $fetch(`/api/mountpoints?id=${mountpoint.id}`, { method: 'DELETE' })
            console.log('Cleaned up mountpoint:', mountpoint.id)
          }
        } catch (err) {
          console.error('Error cleaning up mountpoint:', err)
        }
      }

      isJoined.value = false
      isPublishing.value = false
      publisherId.value = null
      publishers.value = []
      error.value = null

      console.log('Left video room')
    } catch (err) {
      console.error('Leave room error:', err)
    }
  }

  return {
    localStream: readonly(localStream),
    localVideo,
    isJoined: readonly(isJoined),
    isPublishing: readonly(isPublishing),
    roomId: readonly(roomId),
    publisherId: readonly(publisherId),
    publishers: readonly(publishers),
    error: readonly(error),
    joinRoom,
    publishStream,
    leaveRoom
  }
}