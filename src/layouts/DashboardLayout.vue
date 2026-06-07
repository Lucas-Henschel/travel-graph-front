<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const navigationItems = [
  {
    label: "Dashboard",
    to: { name: "dashboard-home" },
  },
  {
    label: "Usuários",
    to: { name: "dashboard-users" },
  },
];

function isActiveRoute(targetName: string) {
  return route.name === targetName;
}

function handleLogout() {
  authStore.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <div
    class="min-h-screen bg-slate-950 text-slate-100 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]"
  >
    <aside
      class="flex flex-col border-r border-white/10 bg-slate-950 px-6 py-6"
    >
      <p class="text-3xl font-semibold tracking- text-center">TravelGraph</p>

      <nav class="mt-10 space-y-2">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.label"
          :class="[
            'block rounded-2xl px-4 py-3 text-sm font-medium transition',
            isActiveRoute(item.to.name as string)
              ? 'bg-white text-slate-950'
              : 'text-slate-300 hover:bg-white/5 hover:text-white',
          ]"
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <button
        class="mt-auto rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950"
        type="button"
        @click="handleLogout"
      >
        Sair
      </button>
    </aside>

    <main class="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>
