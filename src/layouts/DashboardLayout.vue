<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import Divider from "primevue/divider";

import { useNotification } from "@/composables/useNotification";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const toast = useNotification();
const mobileMenuOpen = ref(false);

const navigationItems = [
  {
    label: "Dashboard",
    icon: "pi pi-objects-column",
    to: { name: "dashboard-home" },
  },
  {
    label: "Usuários",
    icon: "pi pi-users",
    to: { name: "dashboard-users" },
  },
];

function isActiveRoute(targetName: string) {
  return route.name === targetName;
}

async function handleLogout() {
  await authService.logout();
  authStore.clearSession();
  toast.success("Sessão encerrada", "Você foi desconectado com sucesso.");
  router.push({ name: "login" });
}

function userInitials() {
  const name = authStore.user?.name ?? "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header
      class="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl lg:hidden"
    >
      <span class="text-lg font-bold tracking-tight text-white"
        >TravelGraph</span
      >

      <Button
        icon="pi pi-bars"
        severity="secondary"
        text
        rounded
        @click="mobileMenuOpen = true"
      />
    </header>

    <Drawer
      v-model:visible="mobileMenuOpen"
      :showCloseIcon="false"
      class="!bg-slate-950 !border-r !border-white/10"
    >
      <template #header>
        <span class="text-xl font-bold tracking-tight text-white"
          >TravelGraph</span
        >
      </template>
      <nav class="flex flex-col gap-1">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.label"
          :class="[
            'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
            isActiveRoute(item.to.name as string)
              ? 'bg-cyan-500/15 text-cyan-400'
              : 'text-slate-400 hover:bg-white/5 hover:text-white',
          ]"
          :to="item.to"
          @click="mobileMenuOpen = false"
        >
          <i :class="[item.icon, 'text-base']" />
          {{ item.label }}
        </RouterLink>
      </nav>
      <template #footer>
        <Divider />
        <div class="flex items-center gap-3 px-2 pb-2">
          <Avatar
            :label="userInitials()"
            shape="circle"
            class="!bg-cyan-500/20 !text-cyan-400 shrink-0"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-white">
              {{ authStore.user?.name }}
            </p>
            <p class="truncate text-xs text-slate-400">
              {{ authStore.user?.email }}
            </p>
          </div>
        </div>
        <Button
          icon="pi pi-sign-out"
          label="Sair"
          severity="secondary"
          text
          class="!w-full !justify-start"
          @click="handleLogout"
        />
      </template>
    </Drawer>

    <div class="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside
        class="hidden lg:flex flex-col fixed inset-y-0 left-0 z-20 w-[17rem] border-r border-white/10 bg-slate-950"
      >
        <div class="px-6 py-6">
          <span class="text-xl font-bold tracking-tight text-white"
            >TravelGraph</span
          >
        </div>

        <nav class="flex-1 space-y-1 px-3">
          <RouterLink
            v-for="item in navigationItems"
            :key="item.label"
            :class="[
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
              isActiveRoute(item.to.name as string)
                ? 'bg-cyan-500/15 text-cyan-400'
                : 'text-slate-400 hover:bg-white/5 hover:text-white',
            ]"
            :to="item.to"
          >
            <i :class="[item.icon, 'text-base']" />
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="mt-auto border-t border-white/10 px-4 py-4">
          <div class="flex items-center gap-3">
            <Avatar
              :label="userInitials()"
              shape="circle"
              class="!bg-cyan-500/20 !text-cyan-400 shrink-0"
            />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-white">
                {{ authStore.user?.name }}
              </p>

              <p class="truncate text-xs text-slate-400">
                {{ authStore.user?.email }}
              </p>
            </div>

            <Button
              icon="pi pi-sign-out"
              severity="secondary"
              text
              rounded
              size="small"
              v-tooltip.top="'Sair'"
              @click="handleLogout"
            />
          </div>
        </div>
      </aside>

      <main class="min-w-0 lg:col-start-2 px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
