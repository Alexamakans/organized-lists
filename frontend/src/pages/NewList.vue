<script setup lang="ts">
// TODO: Maybe make a component for these pages (NewCategory, NewItem, NewList)
//       Could use a slot for the form? I think the rest is the same.

// TODO: Adding items/lists to list at creation.
//       Might want that as a separate edit page though, that we get redirected to?
import { useTemplateRef, inject } from 'vue'

const apiBaseUrl = inject('apiBaseUrl')
const nameInput = useTemplateRef('nameInput')
const submitInput = useTemplateRef('submitInput')
async function handleSubmit() {
  const res = await fetch(`${apiBaseUrl}/list`, {
    method: 'POST',
    body: JSON.stringify({ name: nameInput.value.value }),
    headers: { 'Content-Type': 'application/json' },
  })

  if (res.status !== 201) {
    submitInput.value.classList.add('submit-failed')
    submitInput.value.addEventListener(
      'animationend',
      () => submitInput.value.classList.remove('submit-failed'),
      { once: true },
    )
    return
  }

  submitInput.value.classList.add('submit-succeeded')
  submitInput.value.addEventListener(
    'animationend',
    () => submitInput.value.classList.remove('submit-succeeded'),
    { once: true },
  )
}
</script>

<template>
  <span class="new-list-span">Name</span>
  <form @submit.prevent="handleSubmit" class="new-list-form">
    <input ref="nameInput" type="text" name="name" class="new-list-input new-list-input-name" />
    <input ref="submitInput" type="submit" class="new-list-input new-list-input-submit" />
  </form>
</template>

<style scoped>
.new-list-input-submit {
  transition: background 0.2s ease;
}
.new-list-input-submit:hover {
  cursor: pointer;
  background: var(--color-background-hovered);
}

@keyframes flash-red {
  0% {
    background: rgba(180, 0, 0);
  }
  50% {
    background: var(--color-background);
  }
  100% {
    background: rgba(180, 0, 0);
  }
}

@keyframes flash-green {
  0% {
    background: rgba(0, 180, 0);
  }
  50% {
    background: var(--color-background);
  }
  100% {
    background: rgba(0, 180, 0);
  }
}

.submit-failed {
  animation: flash-red 0.2s ease 2;
}

.submit-succeeded {
  animation: flash-green 0.4s ease 1;
}
</style>
