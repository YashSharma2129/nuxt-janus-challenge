<template>
    <div class="max-w-4xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          VideoRoom Viewer
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Watch live streams from VideoRoom publishers using Janus VideoRoom plugin
        </p>
      </div>
  
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Main Viewer Card -->
        <div class="lg:col-span-2">
          <ViewerCard />
        </div>
  
        <!-- Instructions & Info -->
        <div class="space-y-4">
          <!-- Instructions -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Instructions</h3>
            </template>
            
            <div class="space-y-3 text-sm">
              <div class="flex items-start space-x-2">
                <div class="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</div>
                <p class="text-gray-600 dark:text-gray-400">
                  Available streams will load automatically
                </p>
              </div>

              <div class="flex items-start space-x-2">
                <div class="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</div>
                <p class="text-gray-600 dark:text-gray-400">
                  Select a stream from the dropdown menu
                </p>
              </div>

              <div class="flex items-start space-x-2">
                <div class="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</div>
                <p class="text-gray-600 dark:text-gray-400">
                  Click "Start Watching" to begin playback
                </p>
              </div>

              <div class="flex items-start space-x-2">
                <div class="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">4</div>
                <p class="text-gray-600 dark:text-gray-400">
                  Use video controls for volume and fullscreen
                </p>
              </div>
            </div>
          </UCard>
  
          <!-- Available Streams -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Available Streams</h3>
                <UBadge :color="streamsCount > 0 ? 'green' : 'gray'">
                  {{ streamsCount }}
                </UBadge>
              </div>
            </template>
            
            <div v-if="streamsCount === 0" class="text-center py-4">
              <UIcon name="heroicons:tv" class="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                No streams available
              </p>
              <p class="text-xs text-gray-400">
                Publish a stream from the VideoRoom page first
              </p>
            </div>
  
            <div v-else class="space-y-2">
              <div 
                v-for="stream in availableStreams"
                :key="stream.id"
                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
              >
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ stream.description }}
                  </p>
                  <p class="text-xs text-gray-500">
                    ID: {{ stream.id }} | Room: {{ stream.roomId }}
                  </p>
                </div>
                <UBadge color="green" size="xs">Live</UBadge>
              </div>
            </div>
          </UCard>
  
          <!-- Server Info -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Server Info</h3>
            </template>
            
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400">Janus Server:</span>
                <p class="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1 break-all">
                  {{ janusUrl }}
                </p>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Plugin:</span>
                <span class="ml-2 font-medium">janus.plugin.videoroom (subscriber)</span>
              </div>
            </div>
          </UCard>
  
          <!-- Quick Actions -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Quick Actions</h3>
            </template>
            
            <div class="space-y-2">
              <NuxtLink to="/videoroom">
                <UButton variant="soft" color="blue" size="sm" block>
                  <UIcon name="heroicons:video-camera" class="w-4 h-4 mr-2" />
                  Go to Publisher
                </UButton>
              </NuxtLink>
              
              <UButton 
                @click="refreshStreams" 
                variant="soft" 
                color="gray" 
                size="sm" 
                block
                :loading="isRefreshing"
              >
                <UIcon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
                Refresh Streams
              </UButton>
            </div>
          </UCard>

          <!-- Debug Panel -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Debug Information</h3>
            </template>
            
            <div class="space-y-4">
              <div>
                <h4 class="font-medium mb-2">Available Mountpoints ({{ streamsCount }})</h4>
                <div class="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div v-for="mp in availableStreams" :key="mp.id" class="text-sm mb-2 p-2 bg-white dark:bg-gray-700 rounded border">
                    <div><strong>ID:</strong> {{ mp.id }}</div>
                    <div><strong>Description:</strong> {{ mp.description }}</div>
                    <div><strong>Room:</strong> {{ mp.roomId }}</div>
                    <div><strong>Publisher:</strong> {{ mp.publisherId }}</div>
                    <div><strong>Created:</strong> {{ new Date(mp.createdAt).toLocaleTimeString() }}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="font-medium mb-2">Current State</h4>
                <div class="text-sm space-y-1">
                  <div><strong>Is Loading:</strong> {{ isLoading }}</div>
                  <div><strong>Streams Count:</strong> {{ streamsCount }}</div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const config = useRuntimeConfig()
  const janusUrl = config.public.janusUrl
  
  const { mountpoints, fetchMountpoints, isLoading } = useStreaming()
  const isRefreshing = ref(false)
  
  // Computed properties
  const availableStreams = computed(() => mountpoints.value || [])
  const streamsCount = computed(() => availableStreams.value.length)
  
  // Methods
  const refreshStreams = async () => {
    isRefreshing.value = true
    try {
      await fetchMountpoints()
    } finally {
      isRefreshing.value = false
    }
  }
  
    // Set page meta
  definePageMeta({
    title: 'Viewer - VideoRoom'
  })

  // Set page head
  useHead({
    title: 'VideoRoom Viewer - Janus WebRTC Demo'
  })
  
  // Auto-refresh streams periodically
  let refreshInterval: NodeJS.Timeout
  
  onMounted(() => {
    // Refresh streams every 10 seconds
    refreshInterval = setInterval(() => {
      if (!isLoading.value) {
        fetchMountpoints()
      }
    }, 10000)
  })
  
  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })
  </script>