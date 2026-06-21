<script setup lang="ts">
import { onMounted, ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { useNotification } from "@/composables/useNotification";
import { connectionService } from "@/services/connectionService";
import type { ConnectionResponse } from "@/types/connection";
import { formatHours } from "@/utils/time";
import CreateConnectionDialog from "@/components/connections/CreateConnectionDialog.vue";
import DeleteConnectionDialog from "@/components/connections/DeleteConnectionDialog.vue";
import EditConnectionDialog from "@/components/connections/EditConnectionDialog.vue";

const connections = ref<ConnectionResponse[]>([]);
const loading = ref(false);
const toast = useNotification();

const filters = ref({
  global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
});

const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const selectedConnection = ref<ConnectionResponse | null>(null);

async function fetchConnections() {
  loading.value = true;

  const { data, error } = await connectionService.findAll();

  if (!data || error) {
    connections.value = [];
    toast.error("Erro ao carregar", error);
  } else {
    connections.value = data;
  }

  loading.value = false;
}

function openEditDialog(connection: ConnectionResponse) {
  selectedConnection.value = connection;
  editDialogVisible.value = true;
}

function openDeleteDialog(connection: ConnectionResponse) {
  selectedConnection.value = connection;
  deleteDialogVisible.value = true;
}

onMounted(fetchConnections);
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold text-white">Conexões</h1>
      </div>
    </div>

    <Card class="!bg-slate-900/60 !border !border-white/10 !shadow-none">
      <template #content>
        <div class="flex justify-between mb-6">
          <Button
            icon="pi pi-plus"
            label="Nova conexão"
            size="small"
            @click="createDialogVisible = true"
          />

          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters.global.value"
              placeholder="Buscar conexões..."
              class="!w-full sm:!w-80"
            />
          </IconField>
        </div>

        <DataTable
          :value="connections"
          :loading="loading"
          v-model:filters="filters"
          :globalFilterFields="['originCityName', 'destinationCityName']"
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
          <Column field="originCityName" header="Origem" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-medium text-cyan-400"
                >
                  <i class="pi pi-building text-sm" />
                </div>
                <p class="font-medium text-white">{{ data.originCityName }}</p>
              </div>
            </template>
          </Column>

          <Column field="destinationCityName" header="Destino" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-medium text-emerald-400"
                >
                  <i class="pi pi-building text-sm" />
                </div>
                <p class="font-medium text-white">
                  {{ data.destinationCityName }}
                </p>
              </div>
            </template>
          </Column>

          <Column field="distance" header="Distância" sortable>
            <template #body="{ data }">
              <span class="text-sm text-slate-400">
                {{ data.distance }} km
              </span>
            </template>
          </Column>

          <Column field="time" header="Tempo" sortable>
            <template #body="{ data }">
              <span class="text-sm text-slate-400">
                {{ formatHours(data.time) }}
              </span>
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

          <Column header="Ações" :exportable="false" style="min-width: 5rem">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-pencil"
                  severity="info"
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
              <i class="pi pi-arrows-h mb-2 text-2xl" />
              <p>Nenhuma conexão encontrada.</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <CreateConnectionDialog
      v-model:visible="createDialogVisible"
      @created="fetchConnections"
    />

    <EditConnectionDialog
      v-model:visible="editDialogVisible"
      :connection="selectedConnection"
      @updated="fetchConnections"
    />

    <DeleteConnectionDialog
      v-model:visible="deleteDialogVisible"
      :connection="selectedConnection"
      @deleted="fetchConnections"
    />
  </div>
</template>
