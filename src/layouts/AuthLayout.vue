<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div
      class="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
    >
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.8),_transparent_35%)]"
      />
      <div
        class="absolute inset-x-1/2 top-12 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl"
      />
      <main
        class="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 text-slate-100 shadow-2xl shadow-cyan-950/10 backdrop-blur"
      >
        <RouterView />
      </main>
    </div>
  </div>
</template>
