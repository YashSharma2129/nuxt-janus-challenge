<template>
    <UCard class="w-full">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Viewer - Streaming
          </h3>
          <StatusBadge :status="currentStatus" />
        </div>
      </template>
  
      <div class="space-y-4">
        <!-- Mountpoint Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Stream:
          </label>
          <div class="flex gap-2">
            <USelect
              v-model="selectedMountpointId"
              :options="mountpointOptions"
              placeholder="Choose a stream to watch"
              :disabled="isWatching || isLoading"
              class="flex-1"
            />
            <UButton
              @click="handleFetchMountpoints"
              :loading="isLoading && !isWatching"
              :disabled="isWatching"
              color="gray"
              variant="soft"
              icon="heroicons:arrow-path"
            >
              Refresh
            </UButton>
          </div>
        </div>
  
        <!-- Remote Video Player -->
        <div class="video-container aspect-video bg-gray-900 rounded-lg">
          <video
            ref="remoteVideoRef"
            class="video-element"
            autoplay
            playsinline
            controls
          />
          <div 
            v-if="!remoteStream && !isLoading"
            class="absolute inset-0 flex items-center justify-center text-white"
          >
            <div class="text-center">
              <UIcon name="heroicons:play-circle" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p class="text-sm opacity-75">Select a stream to watch</p>
            </div>
          </div>
          <div 
            v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center text-white"
          >
            <div class="text-center">
              <UIcon name="heroicons:arrow-path" class="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p class="text-sm">Loading stream...</p>
            </div>
          </div>
        </div>
  
        <!-- Stream Information -->
        <div 
          v-if="localSelectedMountpoint"
          class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
        >
          <div class="space-y-1 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Stream:</span>
              <span class="font-medium ml-2">{{ localSelectedMountpoint.description }}</span>
            </div>
            <div v-if="localSelectedMountpoint.roomId">
              <span class="text-gray-500 dark:text-gray-400">Room ID:</span>
              <span class="font-medium ml-2">{{ localSelectedMountpoint.roomId }}</span>
            </div>
          </div>
        </div>
  
        <!-- Error Display -->
        <UAlert
          v-if="error"
          icon="heroicons:exclamation-triangle"
          color="red"
          variant="soft"
          :title="error"
          :close-button="{ icon: 'heroicons:x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
          @close="clearError"
        />
  
        <!-- Control Buttons -->
        <div class="flex gap-2">
          <UButton
            v-if="!isWatching && selectedMountpointId"
            @click="handleStartWatching"
            :loading="isLoading"
            :disabled="isLoading || !selectedMountpointId"
            color="primary"
            icon="heroicons:play"
          >
            Start Watching
          </UButton>
  
          <UButton
            v-if="isWatching"
            @click="handleStopWatching"
            :loading="isLoading"
            :disabled="isLoading"
            color="red"
            variant="soft"
            icon="heroicons:stop"
          >
            Stop Watching
          </UButton>
        </div>
      </div>
    </UCard>
  </template>
  
  <script setup lang="ts">
  const {
    remoteStream,
    remoteVideo,
    mountpoints,
    isWatching,
    isLoading,
    error,
    fetchMountpoints,
    startWatching,
    stopWatching
  } = useStreaming()
  
  const remoteVideoRef = ref<HTMLVideoElement>()
  const selectedMountpointId = ref<number | null>(null)
  const localSelectedMountpoint = ref<any>(null)
  
  // Set video ref
  watch(remoteVideoRef, (video) => {
    remoteVideo.value = video
  })
  
  // Computed status for badge
  const currentStatus = computed(() => {
    if (isLoading.value) return 'loading'
    if (isWatching.value) return 'watching'
    return 'disconnected'
  })
  
  // Computed mountpoint options for select
  const mountpointOptions = computed(() => {
    const options = mountpoints.value.map(mp => ({
      value: mp.id,
      label: mp.description
    }))
    console.log('🔧 Generated mountpoint options:', options)
    return options
  })
  
  // Watch selected mountpoint ID changes and update local selected mountpoint
  watch(selectedMountpointId, (id) => {
    console.log('🔄 selectedMountpointId changed to:', id)
    console.log('🔍 Available mountpoints:', mountpoints.value)
    console.log('🔍 Mountpoint IDs:', mountpoints.value.map(mp => mp.id))
    
    if (id && mountpoints.value.length > 0) {
      // Convert id to number if it's a string to handle type mismatch
      const numericId = typeof id === 'string' ? parseInt(id) : id
      console.log('🔍 Looking for numeric ID:', numericId)
      
      const mountpoint = mountpoints.value.find(mp => mp.id === numericId)
      if (mountpoint) {
        localSelectedMountpoint.value = mountpoint
        console.log('✅ Local selected mountpoint updated:', mountpoint)
      } else {
        console.log('❌ Mountpoint not found for ID:', numericId)
        console.log('🔍 Available IDs:', mountpoints.value.map(mp => mp.id))
        console.log('🔍 Looking for ID:', numericId, 'Type:', typeof numericId)
      }
    } else {
      localSelectedMountpoint.value = null
      console.log('🔄 Local selected mountpoint cleared')
    }
  })
  
  const handleFetchMountpoints = async () => {
    await fetchMountpoints()
  }
  
  const handleStartWatching = async () => {
    console.log('🎬 Start Watching button clicked!')
    console.log('Selected mountpoint ID:', selectedMountpointId.value)
    console.log('Local selected mountpoint:', localSelectedMountpoint.value)
    console.log('Available mountpoints:', mountpoints.value)
    
    if (localSelectedMountpoint.value) {
      console.log('🚀 Attempting to start watching stream...')
      const success = await startWatching(localSelectedMountpoint.value)
      
      if (success) {
        console.log('✅ Successfully started watching stream')
      } else {
        console.log('❌ Failed to start watching stream')
      }
    } else {
      console.log('⚠️ No mountpoint selected')
      console.log('Please select a stream from the dropdown first')
    }
  }
  
  const handleStopWatching = async () => {
    await stopWatching()
    selectedMountpointId.value = null
  }
  
  const clearError = () => {
    // Error will be cleared automatically by composable
  }
  
  // Fetch mountpoints on component mount
  onMounted(() => {
    fetchMountpoints()
  })
  </script>