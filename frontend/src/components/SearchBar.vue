<script setup lang="ts">
defineProps<{
  modelValue: string
  name: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

import { useTemplateRef, onMounted } from 'vue'
const input = useTemplateRef('input')

onMounted(() => {
  let lastKeyPress = 0
  let invalidated = false
  const debounceMs = 160
  input.value.addEventListener('keyup', function () {
    lastKeyPress = Date.now()
    invalidated = true
  })

  setInterval(() => {
    if (invalidated && Date.now() - lastKeyPress >= debounceMs) {
      invalidated = false
      emit('update:modelValue', input.value?.value ?? '')
    }
  }, debounceMs)
})
</script>

<template>
  <input
    ref="input"
    type="text"
    :name="`${name}`"
    :value="modelValue"
    placeholder="Search (regex)..."
    class="search-bar-input"
  />
</template>

<style scoped>
</style>
