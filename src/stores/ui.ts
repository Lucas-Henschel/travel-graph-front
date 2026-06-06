import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = shallowRef(false)

  const isSidebarOpen = computed(() => sidebarOpen.value)

  function openSidebar() {
    sidebarOpen.value = true
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  return {
    sidebarOpen,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar
  }
})
