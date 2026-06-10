<script setup lang="ts">
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";

import { userService } from "@/services/userService";
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/user";

const users = ref<UserResponse[]>([]);
const loading = ref(false);
const searchQuery = ref("");

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const dialogLoading = ref(false);
const dialogError = ref<string | null>(null);
const editingUserId = ref<string | null>(null);

const formName = ref("");
const formEmail = ref("");
const formPassword = ref("");

const deleteDialogVisible = ref(false);
const deletingUser = ref<UserResponse | null>(null);
const deleteLoading = ref(false);

async function fetchUsers() {
  loading.value = true;
  try {
    users.value = await userService.findAll();
  } catch {
    users.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  dialogMode.value = "create";
  formName.value = "";
  formEmail.value = "";
  formPassword.value = "";
  dialogError.value = null;
  editingUserId.value = null;
  dialogVisible.value = true;
}

function openEditDialog(user: UserResponse) {
  dialogMode.value = "edit";
  formName.value = user.name;
  formEmail.value = user.email;
  formPassword.value = "";
  dialogError.value = null;
  editingUserId.value = user.id;
  dialogVisible.value = true;
}

async function handleSave() {
  dialogLoading.value = true;
  dialogError.value = null;

  try {
    if (dialogMode.value === "create") {
      const payload: CreateUserRequest = {
        name: formName.value,
        email: formEmail.value,
        password: formPassword.value,
      };
      await userService.create(payload);
    } else if (editingUserId.value) {
      const payload: UpdateUserRequest = {
        name: formName.value,
        email: formEmail.value,
        password: formPassword.value,
      };
      await userService.update(editingUserId.value, payload);
    }

    dialogVisible.value = false;
    await fetchUsers();
  } catch {
    dialogError.value = "Erro ao salvar usuário.";
  } finally {
    dialogLoading.value = false;
  }
}

function openDeleteDialog(user: UserResponse) {
  deletingUser.value = user;
  deleteDialogVisible.value = true;
}

async function handleDelete() {
  if (!deletingUser.value) return;

  deleteLoading.value = true;

  try {
    await userService.remove(deletingUser.value.id);
    deleteDialogVisible.value = false;
    await fetchUsers();
  } catch {
    // ignore
  } finally {
    deleteLoading.value = false;
  }
}

onMounted(fetchUsers);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold text-white">Usuários</h1>
        <p class="mt-1 text-sm text-slate-400">
          Gerencie os usuários do sistema.
        </p>
      </div>
      <Button
        icon="pi pi-plus"
        label="Novo usuário"
        size="small"
        @click="openCreateDialog"
      />
    </div>

    <!-- Table card -->
    <Card class="!bg-slate-900/60 !border !border-white/10 !shadow-none">
      <template #content>
        <div class="mb-4">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Buscar usuários..."
              class="!w-full sm:!w-80"
            />
          </IconField>
        </div>

        <DataTable
          :value="users"
          :loading="loading"
          :globalFilterFields="['name', 'email']"
          :globalFilter="searchQuery"
          paginator
          :rows="10"
          stripedRows
          :pt="{
            root: { class: '!bg-transparent !border-none' },
            table: { class: '!bg-transparent' },
            thead: { class: '!bg-slate-800/50' },
            headerRow: { class: '!border-b !border-white/10' },
            headerCell: {
              class:
                '!bg-transparent !text-slate-400 !font-medium !text-xs !uppercase !tracking-wider !border-none',
            },
            bodyRow: {
              class:
                '!bg-transparent !border-b !border-white/5 hover:!bg-white/5 !transition-colors',
            },
            bodyCell: {
              class: '!bg-transparent !border-none !text-slate-300',
            },
          }"
        >
          <Column field="name" header="Nome" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-medium text-cyan-400"
                >
                  {{ data.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-medium text-white">{{ data.name }}</p>
                  <p class="text-xs text-slate-500">{{ data.email }}</p>
                </div>
              </div>
            </template>
          </Column>

          <Column field="createdAt" header="Criado em" sortable>
            <template #body="{ data }">
              <span class="text-sm text-slate-400">
                {{
                  data.createdAt
                    ? new Date(data.createdAt).toLocaleDateString("pt-BR")
                    : "—"
                }}
              </span>
            </template>
          </Column>

          <Column header="Ações" :exportable="false" style="min-width: 8rem">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  text
                  rounded
                  size="small"
                  @click="openEditDialog(data)"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  size="small"
                  @click="openDeleteDialog(data)"
                />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="py-8 text-center text-slate-500">
              <i class="pi pi-users mb-2 text-2xl" />
              <p>Nenhum usuário encontrado.</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- Create / Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="dialogMode === 'create' ? 'Novo usuário' : 'Editar usuário'"
      modal
      :style="{ width: '28rem' }"
      :pt="{
        root: { class: '!bg-slate-900 !border !border-white/10' },
        header: { class: '!bg-slate-900 !text-white' },
        content: { class: '!bg-slate-900' },
      }"
    >
      <Message v-if="dialogError" severity="error" :closable="false" class="mb-4">
        {{ dialogError }}
      </Message>

      <div class="flex flex-col gap-5">
        <FloatLabel variant="in">
          <InputText id="form-name" v-model="formName" fluid />
          <label for="form-name">Nome</label>
        </FloatLabel>

        <FloatLabel variant="in">
          <InputText id="form-email" v-model="formEmail" fluid />
          <label for="form-email">E-mail</label>
        </FloatLabel>

        <FloatLabel variant="in">
          <Password
            id="form-password"
            v-model="formPassword"
            :feedback="false"
            fluid
            toggleMask
          />
          <label for="form-password">Senha</label>
        </FloatLabel>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancelar"
            severity="secondary"
            text
            @click="dialogVisible = false"
          />
          <Button
            :label="dialogMode === 'create' ? 'Criar' : 'Salvar'"
            :loading="dialogLoading"
            @click="handleSave"
          />
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Confirmar exclusão"
      modal
      :style="{ width: '24rem' }"
      :pt="{
        root: { class: '!bg-slate-900 !border !border-white/10' },
        header: { class: '!bg-slate-900 !text-white' },
        content: { class: '!bg-slate-900' },
      }"
    >
      <p class="text-slate-300">
        Deseja realmente excluir o usuário
        <strong class="text-white">{{ deletingUser?.name }}</strong
        >?
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancelar"
            severity="secondary"
            text
            @click="deleteDialogVisible = false"
          />
          <Button
            label="Excluir"
            severity="danger"
            :loading="deleteLoading"
            @click="handleDelete"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>
