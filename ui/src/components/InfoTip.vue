<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <a-tooltip :content="content">
    <icon-question-circle />
  </a-tooltip>
</template>
