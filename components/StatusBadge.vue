<template>
    <UBadge 
      :color="badgeColor" 
      :variant="variant"
      size="md"
      class="font-medium"
    >
      <UIcon 
        :name="iconName" 
        class="w-3 h-3 mr-1" 
      />
      {{ status }}
    </UBadge>
  </template>
  
  <script setup lang="ts">
  interface Props {
    status: 'disconnected' | 'connected' | 'publishing' | 'watching' | 'loading'
  }
  
  const props = defineProps<Props>()
  
  const statusConfig = {
    disconnected: {
      color: 'red',
      icon: 'heroicons:x-circle',
      variant: 'soft'
    },
    connected: {
      color: 'green',
      icon: 'heroicons:check-circle',
      variant: 'soft'
    },
    publishing: {
      color: 'blue',
      icon: 'heroicons:video-camera',
      variant: 'soft'
    },
    watching: {
      color: 'purple',
      icon: 'heroicons:play-circle',
      variant: 'soft'
    },
    loading: {
      color: 'yellow',
      icon: 'heroicons:clock',
      variant: 'soft'
    }
  }
  
  const config = computed(() => statusConfig[props.status])
  const badgeColor = computed(() => config.value.color)
  const iconName = computed(() => config.value.icon)
  const variant = computed(() => config.value.variant)
  </script>