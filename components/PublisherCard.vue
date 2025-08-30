<template>
    <UCard class="w-full">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Publisher - VideoRoom
          </h3>
          <StatusBadge :status="currentStatus" />
        </div>
      </template>
  
      <div class="space-y-4">
        <!-- Local Video Preview -->
        <div class="video-container aspect-video bg-gray-900 rounded-lg">
          <video
            ref="localVideoRef"
            class="video-element"
            autoplay
            muted
            playsinline
          />
          <div 
            v-if="!localStream"
            class="absolute inset-0 flex items-center justify-center text-white"
          >
            <div class="text-center">
              <UIcon name="heroicons:video-camera-slash" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p class="text-sm opacity-75">No video stream</p>
            </div>
          </div>
        </div>
  
        <!-- Room Information -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Room ID:</span>
              <span class="font-medium ml-2">{{ roomId }}</span>
            </div>
            <div v-if="publisherId">
              <span class="text-gray-500 dark:text-gray-400">Publisher ID:</span>
              <span class="font-medium ml-2">{{ publisherId }}</span>
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
            v-if="!isJoined"
            @click="handleJoinRoom"
            :loading="isLoading"
            :disabled="isLoading"
            color="primary"
            icon="heroicons:arrow-right-on-rectangle"
          >
            Join Room
          </UButton>
  
          <UButton
            v-if="isJoined && !isPublishing"
            @click="handlePublishStream"
            :loading="isLoading"
            :disabled="isLoading"
            color="blue"
            icon="heroicons:video-camera"
          >
            Start Publishing
          </UButton>
  
          <UButton
            v-if="isJoined"
            @click="handleLeaveRoom"
            :loading="isLoading"
            :disabled="isLoading"
            color="red"
            variant="soft"
            icon="heroicons:arrow-left-on-rectangle"
          >
            Leave Room
          </UButton>
        </div>
      </div>
    </UCard>
  </template>
  
  <script setup lang="ts">
  const {
    localStream,
    localVideo,
    isJoined,
    isPublishing,
    roomId,
    publisherId,
    error,
    joinRoom,
    publishStream,
    leaveRoom
  } = useVideoRoom()
  
  const localVideoRef = ref<HTMLVideoElement>()
  const isLoading = ref(false)
  
  // Set video ref
  watch(localVideoRef, (video) => {
    localVideo.value = video
  })
  
  // Computed status for badge
  const currentStatus = computed(() => {
    if (isLoading.value) return 'loading'
    if (isPublishing.value) return 'publishing'
    if (isJoined.value) return 'connected'
    return 'disconnected'
  })
  
  const handleJoinRoom = async () => {
    isLoading.value = true
    try {
      await joinRoom()
    } finally {
      isLoading.value = false
    }
  }
  
  const handlePublishStream = async () => {
    isLoading.value = true
    try {
      await publishStream()
    } finally {
      isLoading.value = false
    }
  }
  
  const handleLeaveRoom = async () => {
    isLoading.value = true
    try {
      await leaveRoom()
    } finally {
      isLoading.value = false
    }
  }
  
  const clearError = () => {
    // Error will be cleared automatically by composable
  }
  </script>