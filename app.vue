<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UContainer class="py-8">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Nuxt4 + Janus WebRTC Demo
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            VideoRoom Publishing & Streaming Viewer
          </p>
        </div>
  
        <!-- Navigation -->
        <div class="mb-8">
          <div class="flex justify-center">
            <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
              <NuxtLink
                to="/"
                class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                :class="$route.path === '/' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
              >
                Home
              </NuxtLink>
              <NuxtLink
                to="/videoroom"
                class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                :class="$route.path === '/videoroom' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
              >
                Publisher
              </NuxtLink>
              <NuxtLink
                to="/streaming"
                class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                :class="$route.path === '/streaming' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
              >
                Viewer
              </NuxtLink>
            </div>
          </div>
        </div>
  
        <!-- Main Content -->
        <NuxtPage />
  
        <!-- Footer -->
        <div class="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Built with Nuxt4, Janus WebRTC, and Nuxt UI Pro
          </p>
          <p class="mt-1">
            Janus Server: {{ janusUrl }}
          </p>
        </div>
      </UContainer>
    </div>
  </template>
  
  <script setup lang="ts">
  const config = useRuntimeConfig()
  const janusUrl = config.public.janusUrl
  
  // Set page title
  useHead({
    title: 'Nuxt4 Janus WebRTC Demo',
    meta: [
      {
        name: 'description',
        content: 'Demo application showcasing Nuxt4 with Janus WebRTC for video streaming'
      }
    ]
  })
  </script>
  
  <style>
  /* Any global styles can go here */
  </style>