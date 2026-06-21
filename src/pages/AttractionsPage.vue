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
import { attractionService } from "@/services/attractionService";
import type { AttractionResponse } from "@/types/attraction";
import CreateAttractionDialog from "@/components/attractions/CreateAttractionDialog.vue";
import EditAttractionDialog from "@/components/attractions/EditAttractionDialog.vue";
import DeleteAttractionDialog from "@/components/attractions/DeleteAttractionDialog.vue";

const attractions = ref<AttractionResponse[]>([]);
const loading = ref(false);
const toast = useNotification();

const filters = ref({
  global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
});

const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const selectedAttraction = ref<AttractionResponse | null>(null);

async function fetchAttractions() {
  loading.value = true;

  const { data, error } = await attractionService.findAll();

  if (!data || error) {
    attractions.value = [];
    toast.error("Erro ao carregar", error);
  } else {
    attractions.value = data;
  }

  loading.value = false;
}

function openEditDialog(attraction: AttractionResponse) {
  selectedAttraction.value = attraction;
  editDialogVisible.value = true;
}

function openDeleteDialog(attraction: AttractionResponse) {
  selectedAttraction.value = attraction;
  deleteDialogVisible.value = true;
}

onMounted(fetchAttractions);
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold text-white">Pontos Turísticos</h1>
      </div>
    </div>

    <Card class="!bg-slate-900/60 !border !border-white/10 !shadow-none">
      <template #content>
        <div class="flex justify-between mb-6">
          <Button
            icon="pi pi-plus"
            label="Novo ponto turístico"
            size="small"
            @click="createDialogVisible = true"
          />

          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters.global.value"
              placeholder="Buscar pontos turísticos..."
              class="!w-full sm:!w-80"
            />
          </IconField>
        </div>

        <DataTable
          :value="attractions"
          :loading="loading"
          v-model:filters="filters"
          :globalFilterFields="['name', 'category', 'city.name']"
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
                  <i class="pi pi-map-marker text-sm" />
                </div>
                <p class="font-medium text-white">{{ data.name }}</p>
              </div>
            </template>
          </Column>

          <Column field="category" header="Categoria" sortable>
            <template #body="{ data }">
              <span class="text-sm text-slate-400">
                {{ data.category ?? "—" }}
              </span>
            </template>
          </Column>

          <Column field="city.name" header="Cidade" sortable>
            <template #body="{ data }">
              <span class="text-sm text-slate-400">
                {{ data.city?.name ?? "—" }}
              </span>
            </template>
          </Column>

          <Column field="description" header="Descrição">
            <template #body="{ data }">
              <span class="text-sm text-slate-400 line-clamp-1">
                {{ data.description ?? "—" }}
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
              <i class="pi pi-map-marker mb-2 text-2xl" />
              <p>Nenhum ponto turístico encontrado.</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <CreateAttractionDialog
      v-model:visible="createDialogVisible"
      @created="fetchAttractions"
    />

    <EditAttractionDialog
      v-model:visible="editDialogVisible"
      :attraction="selectedAttraction"
      @updated="fetchAttractions"
    />

    <DeleteAttractionDialog
      v-model:visible="deleteDialogVisible"
      :attraction="selectedAttraction"
      @deleted="fetchAttractions"
    />
  </div>
</template>
