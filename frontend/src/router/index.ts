import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/pages/HomePage.vue'
import NewCategory from '@/pages/NewCategory.vue'
import NewItem from '@/pages/NewItem.vue'
import NewList from '@/pages/NewList.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/category/new', component: NewCategory },
  { path: '/item/new', component: NewItem },
  { path: '/list/new', component: NewList },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
