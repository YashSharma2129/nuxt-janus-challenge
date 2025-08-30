<template>
    <div class="max-w-4xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          VideoRoom Publisher
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Join a Janus VideoRoom and publish your webcam stream
        </p>
      </div>
  
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Main Publisher Card -->
        <div class="lg:col-span-2">
          <PublisherCard />
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
                <div class="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</div>
                <p class="text-gray-600 dark:text-gray-400">
                  Click "Join Room" to connect to the VideoRoom
                </p>
              </div>

              <div class="flex items-start space-x-2">
                <div class="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</div>
                <p class="text-gray-600 dark:text-gray-400">
                  Allow camera and microphone access when prompted
                </p>
              </div>

              <div class="flex items-start space-x-2">
                <div class="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</div>
                <p class="text-gray-600 dark:text-gray-400">
                  Click "Start Publishing" to broadcast your stream
                </p>
              </div>

              <div class="flex items-start space-x-2">
                <div class="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">4</div>
                <p class="text-gray-600 dark:text-gray-400">
                  Your stream will be automatically registered for viewers
                </p>
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
                <span class="ml-2 font-medium">janus.plugin.videoroom</span>
              </div>
            </div>
          </UCard>
  
          <!-- Tips -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Tips</h3>
            </template>
            
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-start space-x-2">
                <UIcon name="heroicons:light-bulb" class="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p>Make sure your browser supports WebRTC</p>
              </div>
              <div class="flex items-start space-x-2">
                <UIcon name="heroicons:light-bulb" class="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p>Use a good lighting setup for better video quality</p>
              </div>
              <div class="flex items-start space-x-2">
                <UIcon name="heroicons:light-bulb" class="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p>Check the viewer page to see your published stream</p>
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
  
  // Set page meta
  definePageMeta({
    title: 'Publisher - VideoRoom'
  })
  
  // Set page head
  useHead({
    title: 'VideoRoom Publisher - Janus WebRTC Demo'
  })
  </script>