<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { useNotification } from "@/composables/useNotification";
import { userService } from "@/services/userService";
import type { UserResponse, UpdateUserRequest } from "@/types/user";

const visible = defineModel<boolean>("visible", { required: true });
const props = defineProps<{ user: UserResponse | null }>();
const emit = defineEmits<{ updated: [] }>();

const loading = ref(false);
const formName = ref("");
const formEmail = ref("");
const formPassword = ref("");
const toast = useNotification();

watch(
  () => props.user,
  (user) => {
    if (user) {
      formName.value = user.name;
      formEmail.value = user.email;
      formPassword.value = "";
    }
  },
);

async function handleSave() {
  if (!props.user) return;

  loading.value = true;

  try {
    const payload: UpdateUserRequest = {
      name: formName.value,
      email: formEmail.value,
      password: formPassword.value,
    };
    await userService.update(props.user.id, payload);
    toast.success(
      "Usuário atualizado",
      "O usuário foi atualizado com sucesso.",
    );
    visible.value = false;
    emit("updated");
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
    header="Editar usuário"
    modal
    :style="{ width: '28rem' }"
    :pt="{
      root: { class: '!bg-slate-900 !border !border-white/10' },
      header: { class: '!bg-slate-900 !text-white' },
      content: { class: '!bg-slate-900' },
    }"
  >
    <div class="flex flex-col gap-5">
      <FloatLabel variant="in">
        <InputText id="edit-name" v-model="formName" fluid />
        <label for="edit-name">Nome</label>
      </FloatLabel>

      <FloatLabel variant="in">
        <InputText id="edit-email" v-model="formEmail" fluid />
        <label for="edit-email">E-mail</label>
      </FloatLabel>

      <FloatLabel variant="in">
        <Password
          id="edit-password"
          v-model="formPassword"
          :feedback="false"
          fluid
          toggleMask
        />
        <label for="edit-password">Senha</label>
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
        <Button label="Salvar" :loading="loading" @click="handleSave" />
      </div>
    </template>
  </Dialog>
</template>
