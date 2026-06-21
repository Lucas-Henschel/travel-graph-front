<script setup lang="ts">
import { ref } from "vue";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";
import { z } from "zod";

import { useNotification } from "@/composables/useNotification";
import { userService } from "@/services/userService";
import type { CreateUserRequest } from "@/types/user";

const visible = defineModel<boolean>("visible", { required: true });
const emit = defineEmits<{ created: [] }>();

const loading = ref(false);
const toast = useNotification();

const createUserSchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  email: z
    .string()
    .min(1, "Informe o e-mail.")
    .email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
});

const initialValues: CreateUserRequest = {
  name: "",
  email: "",
  password: "",
};

const resolver = zodResolver(createUserSchema);

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;

  loading.value = true;

  const { error } = await userService.create(event.values as CreateUserRequest);

  if (error) {
    toast.error("Erro ao salvar", error);
    loading.value = false;
    return;
  }

  toast.success("Usuário criado", "O usuário foi criado com sucesso.");
  visible.value = false;
  loading.value = false;

  emit("created");
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Novo usuário"
    modal
    :style="{ width: '28rem' }"
    :pt="{
      root: { class: '!bg-slate-900 !border !border-white/10' },
      header: { class: '!bg-slate-900 !text-white' },
      content: { class: '!bg-slate-900' },
    }"
  >
    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="handleSubmit"
    >
      <div class="flex flex-col gap-5">
        <div class="space-y-2">
          <FloatLabel variant="in">
            <InputText
              id="create-name"
              name="name"
              fluid
              :invalid="$form.name?.invalid"
            />
            <label for="create-name">Nome</label>
          </FloatLabel>

          <Message
            v-if="$form.name?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.name.error?.message }}
          </Message>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="in">
            <InputText
              id="create-email"
              name="email"
              fluid
              :invalid="$form.email?.invalid"
            />
            <label for="create-email">E-mail</label>
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
              id="create-password"
              name="password"
              :feedback="false"
              fluid
              toggleMask
              :invalid="$form.password?.invalid"
            />
            <label for="create-password">Senha</label>
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

      <div class="flex justify-end gap-2 mt-6">
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="visible = false"
        />
        <Button label="Criar" type="submit" :loading="loading" />
      </div>
    </Form>
  </Dialog>
</template>
