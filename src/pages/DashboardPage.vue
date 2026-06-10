<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-white">
        Olá, {{ authStore.user?.name }}
      </h1>

      <p class="mt-1 text-sm text-slate-400">
        Bem-vindo ao painel do TravelGraph.
      </p>
    </div>
  </div>
</template>
