import { createRouter, createWebHistory } from "vue-router";

import AuthLayout from "@/layouts/AuthLayout.vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import AttractionsPage from "@/pages/AttractionsPage.vue";
import CitiesPage from "@/pages/CitiesPage.vue";
import DashboardPage from "@/pages/DashboardPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import RoutesPage from "@/pages/RoutesPage.vue";
import UsersPage from "@/pages/UsersPage.vue";

import { registerGuards } from "./guards";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AuthLayout,
      children: [
        {
          path: "",
          name: "login",
          component: LoginPage,
        },
      ],
    },
    {
      path: "/login",
      redirect: "/",
    },
    {
      path: "/dashboard",
      component: DashboardLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: "",
          redirect: { name: "dashboard-routes" },
        },
        {
          path: "home",
          name: "dashboard-home",
          component: DashboardPage,
        },
        {
          path: "users",
          name: "dashboard-users",
          component: UsersPage,
        },
        {
          path: "cities",
          name: "dashboard-cities",
          component: CitiesPage,
        },
        {
          path: "attractions",
          name: "dashboard-attractions",
          component: AttractionsPage,
        },
        {
          path: "routes",
          name: "dashboard-routes",
          component: RoutesPage,
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

registerGuards(router);

export default router;

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
  }
}
