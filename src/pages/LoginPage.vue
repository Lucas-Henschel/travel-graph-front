<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Button from "primevue/button";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";
import { z } from "zod";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/auth";
import type { LoginCredentials } from "@/types/auth";

const authStore = useAuthStore();
const router = useRouter();

const loading = ref(false);
const errorMessage = ref<string | null>(null);

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
});

const initialValues: LoginCredentials = {
  email: "",
  password: "",
};

const resolver = zodResolver(loginSchema);

async function handleSubmit(event: FormSubmitEvent) {
  loading.value = true;
  errorMessage.value = null;

  try {
    const response = await authService.login(
      event.values as LoginCredentials,
    );

    authStore.setSession(response.token, response.currentUser);
    await router.push("/dashboard");
  } catch (err: unknown) {
    const status =
      err &&
      typeof err === "object" &&
      "response" in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    errorMessage.value =
      status === 422
        ? "E-mail ou senha inválidos."
        : "Erro ao conectar com o servidor.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="space-y-8">
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15"
      >
        <i class="pi pi-map text-2xl text-cyan-400" />
      </div>

      <h2 class="text-2xl font-bold text-white">TravelGraph</h2>

      <p class="mt-2 text-sm text-slate-400">
        Entre com suas credenciais para acessar o painel.
      </p>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <Form
      v-slot="$form"
      class="flex gap-6 flex-col"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="handleSubmit"
    >
      <div class="flex flex-col gap-4">
        <div class="space-y-2">
          <FloatLabel variant="on">
            <InputText
              id="email"
              name="email"
              autocomplete="email"
              fluid
              :invalid="$form.email?.invalid"
              class="h-12"
            />
            <label for="email">E-mail</label>
          </FloatLabel>

          <Message
            v-if="$form.email?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.email.error?.message }}
          </Message>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="on">
            <Password
              id="password"
              name="password"
              autocomplete="current-password"
              :feedback="false"
              fluid
              toggleMask
              :invalid="$form.password?.invalid"
              class="h-12"
            />
            <label for="password">Senha</label>
          </FloatLabel>

          <Message
            v-if="$form.password?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.password.error?.message }}
          </Message>
        </div>
      </div>

      <Button class="w-full" label="Entrar" type="submit" :loading="loading" />
    </Form>
  </section>
</template>
