<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { useNotification } from "@/composables/useNotification";
import { userService } from "@/services/userService";
import type { CreateUserRequest } from "@/types/user";

const visible = defineModel<boolean>("visible", { required: true });
const emit = defineEmits<{ created: [] }>();

const loading = ref(false);
const formName = ref("");
const formEmail = ref("");
const formPassword = ref("");
const toast = useNotification();

function resetForm() {
  formName.value = "";
  formEmail.value = "";
  formPassword.value = "";
}

async function handleSave() {
  loading.value = true;

  try {
    const payload: CreateUserRequest = {
      name: formName.value,
      email: formEmail.value,
      password: formPassword.value,
    };
    await userService.create(payload);
    toast.success("Usuário criado", "O usuário foi criado com sucesso.");
    visible.value = false;
    resetForm();
    emit("created");
  } catch {
    toast.error("Erro ao salvar", "Não foi possível salvar o usuário.");
  } finally {
    loading.value = false;
  }
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
    @hide="resetForm"
  >
    <div class="flex flex-col gap-5">
      <FloatLabel variant="in">
        <InputText id="create-name" v-model="formName" fluid />
        <label for="create-name">Nome</label>
      </FloatLabel>

      <FloatLabel variant="in">
        <InputText id="create-email" v-model="formEmail" fluid />
        <label for="create-email">E-mail</label>
      </FloatLabel>

      <FloatLabel variant="in">
        <Password
          id="create-password"
          v-model="formPassword"
          :feedback="false"
          fluid
          toggleMask
        />
        <label for="create-password">Senha</label>
      </FloatLabel>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="visible = false"
        />
        <Button label="Criar" :loading="loading" @click="handleSave" />
      </div>
    </template>
  </Dialog>
</template>
