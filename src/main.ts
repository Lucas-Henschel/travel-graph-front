import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Aura from "@primeuix/themes/aura";

import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import "primeicons/primeicons.css";
import "./styles/main.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.use(ToastService);

useAuthStore(pinia).hydrateSession();

app.use(router);
app.mount("#app");
