<script setup lang="ts">
import { useRouter } from "vue-router";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Button from "primevue/button";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";
import { z } from "zod";

import { useAuthStore } from "@/stores/auth";
import type { LoginCredentials } from "@/types/auth";

const authStore = useAuthStore();
const router = useRouter();

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
  authStore.login(event.values as LoginCredentials);
  await router.push("/dashboard");
}
</script>

<template>
  <section class="space-y-8">
    <h2 class="text-3xl font-semibold text-white">Acesse o TravelGraph</h2>

    <Form
      v-slot="$form"
      class="flex gap-8 flex-col"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="handleSubmit"
    >
      <div class="flex flex-col gap-4">
        <div class="space-y-2">
          <FloatLabel variant="in">
            <InputText
              id="email"
              name="email"
              autocomplete="email"
              fluid
              :invalid="$form.email?.invalid"
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
          <FloatLabel variant="in">
            <Password
              id="password"
              name="password"
              autocomplete="current-password"
              :feedback="false"
              fluid
              toggleMask
              :invalid="$form.password?.invalid"
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

      <Button class="w-full" label="Entrar" type="submit" />
    </Form>
  </section>
</template>
