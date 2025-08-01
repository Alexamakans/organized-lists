<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter();
</script>

<template>
  <header>
    <nav>
      <a @click.prevent="router.back()" href="#">← Back</a>
      <router-link to="/">Home</router-link>
      <router-link to="/category/new">New Category</router-link>
      <router-link to="/item/new">New Item</router-link>
      <router-link to="/list/new">New List</router-link>
      <a @click.prevent="router.forward()" href="#">Forward →</a>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: var(--color-background-mute);
  backdrop-filter: blur(6px);
  padding: 1rem 0;
  z-index: 100;
}

nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

nav a {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  text-decoration: none;
  font-weight: normal;
  transition: background-color 0.2s ease;
  font-size: clamp(0.8rem, 2vw, 1.2rem);
}

nav a:hover {
  background-color: var(--color-background-hovered);
}
</style>
