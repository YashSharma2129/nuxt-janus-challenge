import { ref, readonly, nextTick } from 'vue'
import type { JanusPlugin, Mountpoint } from '../types/janus'
import { useJanus } from './useJanus'

export const useStreaming = () => {
  const plugin = ref<JanusPlugin | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const remoteVideo = ref<HTMLVideoElement | null>(null)
  const mountpoints = ref<Mountpoint[]>([])
  const selectedMountpoint = ref<Mountpoint | null>(null)
  const isWatching = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const { connect, attachPlugin } = useJanus()
  let subscriptions: any[] = []

  const fetchMountpoints = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      const response = await $fetch<{ data: Mountpoint[] }>('/api/mountpoints')
      mountpoints.value = response.data || []
      console.log('Fetched mountpoints:', mountpoints.value)
      return true
    } catch (err) {
      error.value = `Failed to fetch mountpoints: ${err}`
      console.error('Fetch mountpoints error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const startWatching = async (mountpoint: Mountpoint): Promise<boolean> => {
    console.log('🎯 startWatching called with mountpoint:', mountpoint)

    try {
      isLoading.value = true
      selectedMountpoint.value = mountpoint
      console.log('📡 Connecting to Janus...')

      // Connect to Janus
      const session = await connect()
      if (!session) {
        console.log('❌ Failed to connect to Janus')
        return false
      }
      console.log('✅ Connected to Janus')

      console.log('📦 Importing JanusVideoRoomPlugin...')
      const { JanusVideoRoomPlugin } = await import('typed_janus_js')
      console.log('✅ JanusVideoRoomPlugin imported')

      console.log('🔌 Attaching VideoRoom plugin...')
      const videoRoomPlugin = await attachPlugin(JanusVideoRoomPlugin, { opaqueId: `subscriber-${Date.now()}` })
      if (!videoRoomPlugin) {
        console.log('❌ Failed to attach VideoRoom plugin')
        return false
      }
      console.log('✅ VideoRoom plugin attached')

      plugin.value = videoRoomPlugin
      console.log('📡 Setting up event subscriptions...')
      const messageSub = plugin.value.onMessage.subscribe(({ message, jsep }) => {
        console.log('📨 Received message:', message, 'JSEP:', jsep)
        handleVideoRoomMessage(message, jsep)
      })
      subscriptions.push(messageSub)

      const remoteTrackSub = plugin.value.onRemoteTrack.subscribe((data) => {
        console.log('🎥 Remote track event:', data)
        if (!data) return

        const { track, on, mid } = data
        if (on && track) {
          console.log('🎬 Adding remote track:', track.kind, 'MID:', mid)
          if (!remoteStream.value) {
            remoteStream.value = new MediaStream()
          }
          remoteStream.value.addTrack(track)

          nextTick(() => {
            if (remoteVideo.value && remoteStream.value) {
              remoteVideo.value.srcObject = remoteStream.value
              console.log('✅ Video element updated with remote stream')
            }
          })
        }
      })
      subscriptions.push(remoteTrackSub)

      const cleanupSub = plugin.value.onCleanup.subscribe(() => {
        console.log('🧹 VideoRoom subscriber cleanup')
        if (remoteStream.value) {
          remoteStream.value.getTracks().forEach(track => track.stop())
          remoteStream.value = null
        }
        if (remoteVideo.value) {
          remoteVideo.value.srcObject = null
        }
      })
      subscriptions.push(cleanupSub)

      console.log('🚪 Joining VideoRoom as subscriber...')
      console.log('Room ID:', mountpoint.roomId, 'Publisher ID:', mountpoint.publisherId)

      try {
        const participantsResponse = await plugin.value.listParticipants(mountpoint.roomId)
        console.log('👥 Room participants response:', participantsResponse)

        const participants = participantsResponse.participants || []
        console.log('👥 Extracted participants array:', participants)
        console.log('🔍 All participants details:', participants.map(p => ({
          id: p.id,
          display: p.display,
          publisher: p.publisher,
          type: p.type
        })))

        const publisher = participants.find((p: any) => p.id === mountpoint.publisherId)
        if (publisher) {
          console.log('🎯 Found publisher:', publisher)
          console.log('🔍 Publisher details:', {
            id: publisher.id,
            display: publisher.display,
            publisher: publisher.publisher
          })

          console.log('🔧 Using workaround: connecting directly to mountpoint')

          try {
            console.log('🎯 Attempting direct connection to publisher:', mountpoint.publisherId)
            await plugin.value.joinRoomAsSubscriber(mountpoint.roomId, {
              feed: mountpoint.publisherId
            })
            console.log('✅ Successfully joined VideoRoom as subscriber using direct connection')

            console.log('⏳ Waiting for connection to stabilize...')
            await new Promise(resolve => setTimeout(resolve, 2000))

            if (remoteStream.value && remoteStream.value.getTracks().length > 0) {
              console.log('✅ Media stream detected, connection successful!')
              return true
            } else {
              console.log('⚠️ No media stream detected, connection may not be fully established')
            }
          } catch (directErr) {
            console.log('⚠️ Direct connection failed:', directErr)

            if (publisher.publisher === true) {
              console.log('✅ Participant is confirmed as publisher')
              await plugin.value.joinRoomAsSubscriber(mountpoint.roomId, {
                feed: publisher.id
              })
              console.log('✅ Successfully joined VideoRoom as subscriber')
            } else {
              console.log('⚠️ Participant is not a publisher, looking for active publishers...')
              const activePublisher = participants.find((p: any) => p.publisher === true)
              if (activePublisher) {
                console.log('🎯 Found active publisher:', activePublisher)
                await plugin.value.joinRoomAsSubscriber(mountpoint.roomId, {
                  feed: activePublisher.id
                })
                console.log('✅ Successfully joined VideoRoom as subscriber using active publisher')
              } else {
                console.log('❌ No active publishers found in room')
                console.log('🔄 Waiting for publisher to start streaming (this may take a few seconds)...')

                let attempts = 0
                const maxAttempts = 10
                let foundActivePublisher = false

                while (attempts < maxAttempts && !foundActivePublisher) {
                  attempts++
                  console.log(`🔄 Attempt ${attempts}/${maxAttempts}: Waiting for publisher to become active...`)

                  // Wait 1 second between attempts
                  await new Promise(resolve => setTimeout(resolve, 1000))

                  try {
                    const retryResponse = await plugin.value.listParticipants(mountpoint.roomId)
                    const retryParticipants = retryResponse.participants || []
                    console.log(`🔄 Attempt ${attempts} participants:`, retryParticipants)

                    // Check if our target publisher is now active
                    const retryPublisher = retryParticipants.find((p: any) => p.id === mountpoint.publisherId)
                    if (retryPublisher && retryPublisher.publisher === true) {
                      console.log('✅ Target publisher is now active!')
                      await plugin.value.joinRoomAsSubscriber(mountpoint.roomId, {
                        feed: retryPublisher.id
                      })
                      console.log('✅ Successfully joined VideoRoom as subscriber')
                      foundActivePublisher = true
                      break
                    }

                    // Check if any publisher is now active
                    const anyActivePublisher = retryParticipants.find((p: any) => p.publisher === true)
                    if (anyActivePublisher) {
                      console.log('✅ Found any active publisher:', anyActivePublisher)
                      await plugin.value.joinRoomAsSubscriber(mountpoint.roomId, {
                        feed: anyActivePublisher.id
                      })
                      console.log('✅ Successfully joined VideoRoom as subscriber using any active publisher')
                      foundActivePublisher = true
                      break
                    }
                  } catch (retryErr) {
                    console.log(`⚠️ Error on attempt ${attempts}:`, retryErr)
                  }
                }

                if (!foundActivePublisher) {
                  console.log('❌ Publisher never became active after all attempts')
                  throw new Error('Publisher never became active after waiting')
                }
              }
            }
          }
        } else {
          console.log('❌ Publisher not found in room participants')
          console.log('🔍 Available participants:', participants)
          console.log('🔍 Looking for publisher ID:', mountpoint.publisherId)

          const activePublisher = participants.find((p: any) => p.publisher === true)
          if (activePublisher) {
            console.log('🎯 Found active publisher instead:', activePublisher)
            await plugin.value.joinRoomAsSubscriber(mountpoint.roomId, {
              feed: activePublisher.id
            })
            console.log('✅ Successfully joined VideoRoom as subscriber using active publisher')
          } else {
            console.log('🔄 No active publishers found, waiting for any publisher to start...')

            let attempts = 0
            const maxAttempts = 10
            let foundActivePublisher = false

            while (attempts < maxAttempts && !foundActivePublisher) {
              attempts++
              console.log(`🔄 Attempt ${attempts}/${maxAttempts}: Waiting for any publisher to become active...`)

              await new Promise(resolve => setTimeout(resolve, 1000))

              try {
                const retryResponse = await plugin.value.listParticipants(mountpoint.roomId)
                const retryParticipants = retryResponse.participants || []
                const retryActivePublisher = retryParticipants.find((p: any) => p.publisher === true)

                if (retryActivePublisher) {
                  console.log('✅ Found active publisher after waiting:', retryActivePublisher)
                  await plugin.value.joinRoomAsSubscriber(mountpoint.roomId, {
                    feed: retryActivePublisher.id
                  })
                  console.log('✅ Successfully joined VideoRoom as subscriber after waiting')
                  foundActivePublisher = true
                  break
                }
              } catch (retryErr) {
                console.log(`⚠️ Error on attempt ${attempts}:`, retryErr)
              }
            }

            if (!foundActivePublisher) {
              throw new Error('No active publishers found after waiting')
            }
          }
        }
      } catch (err) {
        console.error('❌ Error listing participants:', err)
        throw err
      }

      return true

    } catch (err) {
      console.error('💥 Start watching error:', err)
      error.value = `Failed to start watching: ${err}`
      return false
    } finally {
      isLoading.value = false
    }
  }

  const handleVideoRoomMessage = async (msg: any, jsep?: any) => {
    console.log('📨 handleVideoRoomMessage called with:', { msg, jsep })

    if (msg.videoroom === 'attached') {
      console.log('✅ Attached to publisher feed')
      isWatching.value = true
    } else if (msg.videoroom === 'event') {
      console.log('📡 VideoRoom event:', msg)
      if (msg.started === 'ok') {
        console.log('🎬 Stream started successfully')
        isWatching.value = true
      } else if (msg.error_code) {
        console.error('❌ VideoRoom error:', msg.error_code, msg.error)

        if (msg.error_code === 428 && msg.error.includes('No such feed')) {
          console.log('⚠️ No such feed error - publisher may not be streaming yet')
          console.log('🔄 This usually means the publisher is still setting up their stream')
          console.log('💡 Try waiting a bit longer before connecting, or check if publisher is actually streaming')

          error.value = 'Publisher is not streaming yet. Please wait a moment and try again.'
        }
      }
    } else if (msg.videoroom === 'joined') {
      console.log('🚪 Joined VideoRoom as subscriber')
    } else if (msg.videoroom === 'leaving') {
      console.log('👋 Leaving VideoRoom')
    }

    if (jsep && jsep.type === 'offer') {
      console.log('📋 Received WebRTC offer, creating answer...')
      try {
        const answer = await plugin.value.createAnswer({
          jsep: jsep
        })
        console.log('✅ Created WebRTC answer')

        await plugin.value.startAsSubscriber(answer)
        console.log('🎬 Started as subscriber')
      } catch (err) {
        console.error('❌ Error handling VideoRoom message:', err)
        error.value = `Failed to handle VideoRoom message: ${err}`
      }
    } else if (jsep) {
      console.log('📋 Received JSEP (not offer):', jsep)
    }
  }

  const stopWatching = async () => {
    try {
      subscriptions.forEach(sub => sub.unsubscribe())
      subscriptions = []

      if (plugin.value) {
        await plugin.value.leave()
        plugin.value = null
      }

      if (remoteStream.value) {
        remoteStream.value.getTracks().forEach(track => track.stop())
        remoteStream.value = null
      }

      if (remoteVideo.value) {
        remoteVideo.value.srcObject = null
      }

      isWatching.value = false
      selectedMountpoint.value = null
      error.value = null

      console.log('Stopped watching stream')
    } catch (err) {
      console.error('Stop watching error:', err)
    }
  }

  return {
    remoteStream: readonly(remoteStream),
    remoteVideo,
    mountpoints: readonly(mountpoints),
    selectedMountpoint: readonly(selectedMountpoint),
    isWatching: readonly(isWatching),
    isLoading: readonly(isLoading),
    error: readonly(error),

    fetchMountpoints,
    startWatching,
    stopWatching,
  }
}