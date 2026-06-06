import type { Router } from "vue-router";

import { useAuthStore } from "@/stores/auth";

export function registerGuards(router: Router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (!authStore.hydrated) {
      authStore.hydrateSession();
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth && !authStore.isAuthenticated) {
      return {
        name: "login",
        query: {
          redirect: to.fullPath,
        },
      };
    }

    if (to.name === "login" && authStore.isAuthenticated) {
      return { name: "dashboard" };
    }

    return undefined;
  });
}
