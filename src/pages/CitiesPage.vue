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
import { cityService } from "@/services/cityService";
import type { CityResponse } from "@/types/city";
import CreateCityDialog from "@/components/cities/CreateCityDialog.vue";
import EditCityDialog from "@/components/cities/EditCityDialog.vue";
import DeleteCityDialog from "@/components/cities/DeleteCityDialog.vue";

const cities = ref<CityResponse[]>([]);
const loading = ref(false);
const toast = useNotification();

const filters = ref({
  global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
});

const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const selectedCity = ref<CityResponse | null>(null);

async function fetchCities() {
  loading.value = true;

  const { data, error } = await cityService.findAll();

  if (!data || error) {
    cities.value = [];
    toast.error("Erro ao carregar", error);
  } else {
    cities.value = data;
  }

  loading.value = false;
}

function openEditDialog(city: CityResponse) {
  selectedCity.value = city;
  editDialogVisible.value = true;
}

function openDeleteDialog(city: CityResponse) {
  selectedCity.value = city;
  deleteDialogVisible.value = true;
}

onMounted(fetchCities);
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold text-white">Cidades</h1>
      </div>
    </div>

    <Card class="!bg-slate-900/60 !border !border-white/10 !shadow-none">
      <template #content>
        <div class="flex justify-between mb-6">
          <Button
            icon="pi pi-plus"
            label="Nova cidade"
            size="small"
            @click="createDialogVisible = true"
          />

          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters.global.value"
              placeholder="Buscar cidades..."
              class="!w-full sm:!w-80"
            />
          </IconField>
        </div>

        <DataTable
          :value="cities"
          :loading="loading"
          v-model:filters="filters"
          :globalFilterFields="['name']"
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
                  <i class="pi pi-building text-sm" />
                </div>
                <p class="font-medium text-white">{{ data.name }}</p>
              </div>
            </template>
          </Column>

          <Column field="latitude" header="Latitude" sortable>
            <template #body="{ data }">
              <span class="text-sm text-slate-400">
                {{ data.latitude ?? "—" }}
              </span>
            </template>
          </Column>

          <Column field="longitude" header="Longitude" sortable>
            <template #body="{ data }">
              <span class="text-sm text-slate-400">
                {{ data.longitude ?? "—" }}
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
              <i class="pi pi-building mb-2 text-2xl" />
              <p>Nenhuma cidade encontrada.</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <CreateCityDialog
      v-model:visible="createDialogVisible"
      @created="fetchCities"
    />

    <EditCityDialog
      v-model:visible="editDialogVisible"
      :city="selectedCity"
      @updated="fetchCities"
    />

    <DeleteCityDialog
      v-model:visible="deleteDialogVisible"
      :city="selectedCity"
      @deleted="fetchCities"
    />
  </div>
</template>
