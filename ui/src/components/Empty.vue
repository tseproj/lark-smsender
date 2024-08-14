<template>
  <a-result :status="null" :title="title" :subtitle="subtitle">
    <template #icon>
      <icon-empty />
    </template>
    <template #extra>
      <slot />
    </template>
  </a-result>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})
</script>
