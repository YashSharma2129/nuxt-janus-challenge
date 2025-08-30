<template>
    <div class="max-w-4xl mx-auto">
      <!-- Welcome Section -->
      <UCard class="mb-8">
        <div class="text-center py-8">
          <UIcon name="heroicons:video-camera" class="w-16 h-16 mx-auto text-primary-500 mb-4" />
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Janus WebRTC Demo
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            This application demonstrates WebRTC streaming using Janus Gateway with Nuxt4. 
            Publishers can broadcast their video streams, and viewers can watch them in real-time.
          </p>
        </div>
      </UCard>
  
      <!-- Features Grid -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- Publisher Card -->
        <UCard>
          <div class="text-center p-6">
            <UIcon name="heroicons:video-camera" class="w-12 h-12 mx-auto text-blue-500 mb-4" />
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Publisher
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Join a VideoRoom and publish your webcam stream. Your stream will be automatically 
              registered as a mountpoint for viewers.
            </p>
            <NuxtLink to="/videoroom">
              <UButton color="blue" block>
                Go to Publisher
                <UIcon name="heroicons:arrow-right" class="ml-2 w-4 h-4" />
              </UButton>
            </NuxtLink>
          </div>
        </UCard>
  
        <!-- Viewer Card -->
        <UCard>
          <div class="text-center p-6">
            <UIcon name="heroicons:play-circle" class="w-12 h-12 mx-auto text-purple-500 mb-4" />
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Viewer
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Browse available streams and watch live video feeds from publishers 
              using the Janus Streaming plugin.
            </p>
            <NuxtLink to="/streaming">
              <UButton color="purple" block>
                Go to Viewer
                <UIcon name="heroicons:arrow-right" class="ml-2 w-4 h-4" />
              </UButton>
            </NuxtLink>
          </div>
        </UCard>
      </div>
  
      <!-- How It Works -->
      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            How It Works
          </h3>
        </template>
  
        <div class="space-y-6">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span class="text-blue-600 dark:text-blue-400 font-medium text-sm">1</span>
              </div>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white mb-1">
                Publisher Joins VideoRoom
              </h4>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                Publisher connects to Janus server and joins a VideoRoom with their webcam stream.
              </p>
            </div>
          </div>
  
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span class="text-blue-600 dark:text-blue-400 font-medium text-sm">2</span>
              </div>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white mb-1">
                Mountpoint Registration
              </h4>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                After successful publishing, the stream is registered as a mountpoint in our backend API.
              </p>
            </div>
          </div>
  
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span class="text-blue-600 dark:text-blue-400 font-medium text-sm">3</span>
              </div>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white mb-1">
                Viewer Watches Stream
              </h4>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                Viewers can select from available mountpoints and watch live streams using the Streaming plugin.
              </p>
            </div>
          </div>
        </div>
      </UCard>
  
      <!-- Technical Info -->
      <div class="mt-8 grid md:grid-cols-3 gap-4">
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
          <UIcon name="heroicons:cube" class="w-8 h-8 mx-auto text-green-500 mb-2" />
          <h4 class="font-medium text-gray-900 dark:text-white mb-1">Nuxt4</h4>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Modern Vue.js framework</p>
        </div>
        
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
          <UIcon name="heroicons:signal" class="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <h4 class="font-medium text-gray-900 dark:text-white mb-1">Janus Gateway</h4>
          <p class="text-gray-600 dark:text-gray-400 text-sm">WebRTC server solution</p>
        </div>
        
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
          <UIcon name="heroicons:paint-brush" class="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <h4 class="font-medium text-gray-900 dark:text-white mb-1">Nuxt UI Pro</h4>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Beautiful UI components</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // Set page meta
  definePageMeta({
    title: 'Home - Janus WebRTC Demo'
  })
  </script>