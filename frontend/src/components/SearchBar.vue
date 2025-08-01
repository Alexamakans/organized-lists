<script setup lang="ts">
defineProps<{
  modelValue: string,
  name: string,
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

import { useTemplateRef, onMounted } from "vue";
const input = useTemplateRef("input");

onMounted(() => {
  let lastKeyPress = 0;
  let invalidated = false;
  const debounceMs = 100;
  input.value.addEventListener("keyup", function () {
    lastKeyPress = Date.now();
    invalidated = true;
  });

  setInterval(() => {
    if (invalidated && Date.now() - lastKeyPress >= debounceMs) {
      invalidated = false;
      emit("update:modelValue", input.value?.value ?? "");
    }
  }, debounceMs);
});
</script>

<template>
  <input ref="input" type="text" :name="`${name}`" :value="modelValue" placeholder="Search (regex)..." />
</template>

<style scoped>
input {
  width: 100%;
  font-size: 1rem;
  border: var(--border-style) var(--border-thickness) var(--color-border);
  border-radius: var(--border-radius);
}
</style>
