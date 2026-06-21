# Cities & Attractions CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CRUD pages for Cities and Attractions under the "Turismo" navigation section, following the existing UsersPage pattern (DataTable + Dialogs + ServiceResult + Zod + Toast).

**Architecture:** Each entity (City, Attraction) gets its own types file, service file, page component, and three dialog components (Create/Edit/Delete). The DashboardLayout navigation and router are updated to expose the new pages. Attractions depend on Cities (dropdown for city selection).

**Tech Stack:** Vue 3 Composition API, TypeScript, PrimeVue 4, Zod, Tailwind CSS, Axios

---

### Task 1: City Types

**Files:**
- Create: `src/types/city.ts`

- [ ] **Step 1: Create the city types file**

```typescript
export interface CityResponse {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityRequest {
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface UpdateCityRequest {
  name: string;
  latitude: number | null;
  longitude: number | null;
}
```

---

### Task 2: City Service

**Files:**
- Create: `src/services/cityService.ts`
- Reference: `src/services/userService.ts` (pattern to follow)

- [ ] **Step 1: Create the city service**

```typescript
import api, { extractErrorMessage } from "./api";
import type { ServiceResult } from "@/types/api";
import type {
  CityResponse,
  CreateCityRequest,
  UpdateCityRequest,
} from "@/types/city";

export const cityService = {
  async findAll(): Promise<ServiceResult<CityResponse[]>> {
    try {
      const { data } = await api.get<CityResponse[]>("/cities");
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async findById(id: number): Promise<ServiceResult<CityResponse>> {
    try {
      const { data } = await api.get<CityResponse>(`/cities/${id}`);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async create(
    payload: CreateCityRequest,
  ): Promise<ServiceResult<CityResponse>> {
    try {
      const { data } = await api.post<CityResponse>("/cities", payload);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async update(
    id: number,
    payload: UpdateCityRequest,
  ): Promise<ServiceResult<CityResponse>> {
    try {
      const { data } = await api.put<CityResponse>(`/cities/${id}`, payload);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async remove(id: number): Promise<ServiceResult<void>> {
    try {
      await api.delete(`/cities/${id}`);
      return { data: undefined as void, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },
};
```

---

### Task 3: City Dialog Components

**Files:**
- Create: `src/components/cities/CreateCityDialog.vue`
- Create: `src/components/cities/EditCityDialog.vue`
- Create: `src/components/cities/DeleteCityDialog.vue`
- Reference: `src/components/users/CreateUserDialog.vue`, `EditUserDialog.vue`, `DeleteUserDialog.vue`

- [ ] **Step 1: Create CreateCityDialog.vue**

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { z } from "zod";

import { useNotification } from "@/composables/useNotification";
import { cityService } from "@/services/cityService";
import type { CreateCityRequest } from "@/types/city";

const visible = defineModel<boolean>("visible", { required: true });
const emit = defineEmits<{ created: [] }>();

const loading = ref(false);
const toast = useNotification();

const createCitySchema = z.object({
  name: z
    .string()
    .min(1, "Informe o nome.")
    .max(100, "Nome deve ter no máximo 100 caracteres."),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

const initialValues: CreateCityRequest = {
  name: "",
  latitude: null,
  longitude: null,
};

const resolver = zodResolver(createCitySchema);

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;

  loading.value = true;

  const { error } = await cityService.create(
    event.values as CreateCityRequest,
  );

  if (error) {
    toast.error("Erro ao salvar", error);
    loading.value = false;
    return;
  }

  toast.success("Cidade criada", "A cidade foi criada com sucesso.");
  visible.value = false;
  loading.value = false;

  emit("created");
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Nova cidade"
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
              id="create-city-name"
              name="name"
              fluid
              :invalid="$form.name?.invalid"
            />
            <label for="create-city-name">Nome</label>
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
            <InputNumber
              id="create-city-latitude"
              name="latitude"
              fluid
              :minFractionDigits="1"
              :maxFractionDigits="8"
            />
            <label for="create-city-latitude">Latitude</label>
          </FloatLabel>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="in">
            <InputNumber
              id="create-city-longitude"
              name="longitude"
              fluid
              :minFractionDigits="1"
              :maxFractionDigits="8"
            />
            <label for="create-city-longitude">Longitude</label>
          </FloatLabel>
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
```

- [ ] **Step 2: Create EditCityDialog.vue**

```vue
<script setup lang="ts">
import { ref, watch } from "vue";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { z } from "zod";

import { useNotification } from "@/composables/useNotification";
import { cityService } from "@/services/cityService";
import type { CityResponse, UpdateCityRequest } from "@/types/city";

const visible = defineModel<boolean>("visible", { required: true });
const props = defineProps<{ city: CityResponse | null }>();
const emit = defineEmits<{ updated: [] }>();

const loading = ref(false);
const toast = useNotification();

const editCitySchema = z.object({
  name: z
    .string()
    .min(1, "Informe o nome.")
    .max(100, "Nome deve ter no máximo 100 caracteres."),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

const initialValues = ref<UpdateCityRequest>({
  name: "",
  latitude: null,
  longitude: null,
});

const resolver = zodResolver(editCitySchema);

watch(
  () => props.city,
  (city) => {
    if (city) {
      initialValues.value = {
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
      };
    }
  },
);

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid || !props.city) return;

  loading.value = true;

  const { error } = await cityService.update(
    props.city.id,
    event.values as UpdateCityRequest,
  );

  if (error) {
    toast.error("Erro ao salvar", error);
    loading.value = false;
    return;
  }

  toast.success("Cidade atualizada", "A cidade foi atualizada com sucesso.");
  visible.value = false;
  loading.value = false;

  emit("updated");
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Editar cidade"
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
              id="edit-city-name"
              name="name"
              fluid
              :invalid="$form.name?.invalid"
            />
            <label for="edit-city-name">Nome</label>
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
            <InputNumber
              id="edit-city-latitude"
              name="latitude"
              fluid
              :minFractionDigits="1"
              :maxFractionDigits="8"
            />
            <label for="edit-city-latitude">Latitude</label>
          </FloatLabel>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="in">
            <InputNumber
              id="edit-city-longitude"
              name="longitude"
              fluid
              :minFractionDigits="1"
              :maxFractionDigits="8"
            />
            <label for="edit-city-longitude">Longitude</label>
          </FloatLabel>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="visible = false"
        />
        <Button label="Salvar" type="submit" :loading="loading" />
      </div>
    </Form>
  </Dialog>
</template>
```

- [ ] **Step 3: Create DeleteCityDialog.vue**

```vue
<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useNotification } from "@/composables/useNotification";
import { cityService } from "@/services/cityService";
import type { CityResponse } from "@/types/city";

const visible = defineModel<boolean>("visible", { required: true });
const props = defineProps<{ city: CityResponse | null }>();
const emit = defineEmits<{ deleted: [] }>();

const loading = ref(false);
const toast = useNotification();

async function handleDelete() {
  if (!props.city) return;

  loading.value = true;

  const { error } = await cityService.remove(props.city.id);

  if (error) {
    toast.error("Erro ao excluir", error);
    loading.value = false;
    return;
  }

  toast.success("Cidade excluída", "A cidade foi excluída com sucesso.");
  visible.value = false;
  loading.value = false;

  emit("deleted");
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
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
      Deseja realmente excluir a cidade
      <strong class="text-white">{{ city?.name }}</strong
      >?
    </p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="visible = false"
        />

        <Button
          label="Excluir"
          severity="danger"
          :loading="loading"
          @click="handleDelete"
        />
      </div>
    </template>
  </Dialog>
</template>
```

---

### Task 4: CitiesPage

**Files:**
- Create: `src/pages/CitiesPage.vue`
- Reference: `src/pages/UsersPage.vue`

- [ ] **Step 1: Create CitiesPage.vue**

```vue
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
```

---

### Task 5: Attraction Types

**Files:**
- Create: `src/types/attraction.ts`

- [ ] **Step 1: Create the attraction types file**

```typescript
import type { CityResponse } from "./city";

export interface AttractionResponse {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  city: CityResponse;
}

export interface CreateAttractionRequest {
  name: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  cityId: number;
}

export interface UpdateAttractionRequest {
  name: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
}

export const ATTRACTION_CATEGORIES = [
  "Museu",
  "Parque",
  "Praia",
  "Monumento",
  "Restaurante",
  "Igreja",
  "Mirante",
  "Centro Histórico",
  "Teatro",
  "Outro",
] as const;
```

---

### Task 6: Attraction Service

**Files:**
- Create: `src/services/attractionService.ts`

- [ ] **Step 1: Create the attraction service**

```typescript
import api, { extractErrorMessage } from "./api";
import type { ServiceResult } from "@/types/api";
import type {
  AttractionResponse,
  CreateAttractionRequest,
  UpdateAttractionRequest,
} from "@/types/attraction";

export const attractionService = {
  async findAll(): Promise<ServiceResult<AttractionResponse[]>> {
    try {
      const { data } = await api.get<AttractionResponse[]>("/attractions");
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async findById(id: number): Promise<ServiceResult<AttractionResponse>> {
    try {
      const { data } = await api.get<AttractionResponse>(`/attractions/${id}`);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async create(
    payload: CreateAttractionRequest,
  ): Promise<ServiceResult<AttractionResponse>> {
    try {
      const { data } = await api.post<AttractionResponse>(
        "/attractions",
        payload,
      );
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async update(
    id: number,
    payload: UpdateAttractionRequest,
  ): Promise<ServiceResult<AttractionResponse>> {
    try {
      const { data } = await api.put<AttractionResponse>(
        `/attractions/${id}`,
        payload,
      );
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async remove(id: number): Promise<ServiceResult<void>> {
    try {
      await api.delete(`/attractions/${id}`);
      return { data: undefined as void, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },
};
```

---

### Task 7: Attraction Dialog Components

**Files:**
- Create: `src/components/attractions/CreateAttractionDialog.vue`
- Create: `src/components/attractions/EditAttractionDialog.vue`
- Create: `src/components/attractions/DeleteAttractionDialog.vue`

- [ ] **Step 1: Create CreateAttractionDialog.vue**

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import { z } from "zod";

import { useNotification } from "@/composables/useNotification";
import { attractionService } from "@/services/attractionService";
import { cityService } from "@/services/cityService";
import type { CreateAttractionRequest } from "@/types/attraction";
import { ATTRACTION_CATEGORIES } from "@/types/attraction";
import type { CityResponse } from "@/types/city";

const visible = defineModel<boolean>("visible", { required: true });
const emit = defineEmits<{ created: [] }>();

const loading = ref(false);
const cities = ref<CityResponse[]>([]);
const toast = useNotification();

const createAttractionSchema = z.object({
  name: z
    .string()
    .min(1, "Informe o nome.")
    .max(100, "Nome deve ter no máximo 100 caracteres."),
  description: z
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres.")
    .nullable(),
  category: z.string().max(50).nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  cityId: z.number({ required_error: "Selecione a cidade." }),
});

const initialValues = {
  name: "",
  description: null,
  category: null,
  latitude: null,
  longitude: null,
  cityId: undefined,
};

const resolver = zodResolver(createAttractionSchema);

async function fetchCities() {
  const { data } = await cityService.findAll();
  if (data) cities.value = data;
}

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;

  loading.value = true;

  const { error } = await attractionService.create(
    event.values as CreateAttractionRequest,
  );

  if (error) {
    toast.error("Erro ao salvar", error);
    loading.value = false;
    return;
  }

  toast.success(
    "Ponto turístico criado",
    "O ponto turístico foi criado com sucesso.",
  );
  visible.value = false;
  loading.value = false;

  emit("created");
}

onMounted(fetchCities);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Novo ponto turístico"
    modal
    :style="{ width: '32rem' }"
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
              id="create-attraction-name"
              name="name"
              fluid
              :invalid="$form.name?.invalid"
            />
            <label for="create-attraction-name">Nome</label>
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
            <Textarea
              id="create-attraction-description"
              name="description"
              fluid
              rows="3"
            />
            <label for="create-attraction-description">Descrição</label>
          </FloatLabel>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="in">
            <Select
              id="create-attraction-category"
              name="category"
              :options="[...ATTRACTION_CATEGORIES]"
              fluid
            />
            <label for="create-attraction-category">Categoria</label>
          </FloatLabel>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="in">
            <Select
              id="create-attraction-city"
              name="cityId"
              :options="cities"
              optionLabel="name"
              optionValue="id"
              fluid
              :invalid="$form.cityId?.invalid"
            />
            <label for="create-attraction-city">Cidade</label>
          </FloatLabel>

          <Message
            v-if="$form.cityId?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.cityId.error?.message }}
          </Message>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <FloatLabel variant="in">
              <InputNumber
                id="create-attraction-latitude"
                name="latitude"
                fluid
                :minFractionDigits="1"
                :maxFractionDigits="8"
              />
              <label for="create-attraction-latitude">Latitude</label>
            </FloatLabel>
          </div>

          <div class="space-y-2">
            <FloatLabel variant="in">
              <InputNumber
                id="create-attraction-longitude"
                name="longitude"
                fluid
                :minFractionDigits="1"
                :maxFractionDigits="8"
              />
              <label for="create-attraction-longitude">Longitude</label>
            </FloatLabel>
          </div>
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
```

- [ ] **Step 2: Create EditAttractionDialog.vue**

```vue
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import { z } from "zod";

import { useNotification } from "@/composables/useNotification";
import { attractionService } from "@/services/attractionService";
import { cityService } from "@/services/cityService";
import type {
  AttractionResponse,
  UpdateAttractionRequest,
} from "@/types/attraction";
import { ATTRACTION_CATEGORIES } from "@/types/attraction";
import type { CityResponse } from "@/types/city";

const visible = defineModel<boolean>("visible", { required: true });
const props = defineProps<{ attraction: AttractionResponse | null }>();
const emit = defineEmits<{ updated: [] }>();

const loading = ref(false);
const cities = ref<CityResponse[]>([]);
const toast = useNotification();

const editAttractionSchema = z.object({
  name: z
    .string()
    .min(1, "Informe o nome.")
    .max(100, "Nome deve ter no máximo 100 caracteres."),
  description: z
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres.")
    .nullable(),
  category: z.string().max(50).nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

const initialValues = ref<UpdateAttractionRequest>({
  name: "",
  description: null,
  category: null,
  latitude: null,
  longitude: null,
});

const resolver = zodResolver(editAttractionSchema);

async function fetchCities() {
  const { data } = await cityService.findAll();
  if (data) cities.value = data;
}

watch(
  () => props.attraction,
  (attraction) => {
    if (attraction) {
      initialValues.value = {
        name: attraction.name,
        description: attraction.description,
        category: attraction.category,
        latitude: attraction.latitude,
        longitude: attraction.longitude,
      };
    }
  },
);

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid || !props.attraction) return;

  loading.value = true;

  const { error } = await attractionService.update(
    props.attraction.id,
    event.values as UpdateAttractionRequest,
  );

  if (error) {
    toast.error("Erro ao salvar", error);
    loading.value = false;
    return;
  }

  toast.success(
    "Ponto turístico atualizado",
    "O ponto turístico foi atualizado com sucesso.",
  );
  visible.value = false;
  loading.value = false;

  emit("updated");
}

onMounted(fetchCities);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Editar ponto turístico"
    modal
    :style="{ width: '32rem' }"
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
              id="edit-attraction-name"
              name="name"
              fluid
              :invalid="$form.name?.invalid"
            />
            <label for="edit-attraction-name">Nome</label>
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
            <Textarea
              id="edit-attraction-description"
              name="description"
              fluid
              rows="3"
            />
            <label for="edit-attraction-description">Descrição</label>
          </FloatLabel>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="in">
            <Select
              id="edit-attraction-category"
              name="category"
              :options="[...ATTRACTION_CATEGORIES]"
              fluid
            />
            <label for="edit-attraction-category">Categoria</label>
          </FloatLabel>
        </div>

        <div class="space-y-2">
          <span class="text-xs text-slate-500">
            Cidade: {{ attraction?.city?.name ?? "—" }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <FloatLabel variant="in">
              <InputNumber
                id="edit-attraction-latitude"
                name="latitude"
                fluid
                :minFractionDigits="1"
                :maxFractionDigits="8"
              />
              <label for="edit-attraction-latitude">Latitude</label>
            </FloatLabel>
          </div>

          <div class="space-y-2">
            <FloatLabel variant="in">
              <InputNumber
                id="edit-attraction-longitude"
                name="longitude"
                fluid
                :minFractionDigits="1"
                :maxFractionDigits="8"
              />
              <label for="edit-attraction-longitude">Longitude</label>
            </FloatLabel>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="visible = false"
        />
        <Button label="Salvar" type="submit" :loading="loading" />
      </div>
    </Form>
  </Dialog>
</template>
```

- [ ] **Step 3: Create DeleteAttractionDialog.vue**

```vue
<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useNotification } from "@/composables/useNotification";
import { attractionService } from "@/services/attractionService";
import type { AttractionResponse } from "@/types/attraction";

const visible = defineModel<boolean>("visible", { required: true });
const props = defineProps<{ attraction: AttractionResponse | null }>();
const emit = defineEmits<{ deleted: [] }>();

const loading = ref(false);
const toast = useNotification();

async function handleDelete() {
  if (!props.attraction) return;

  loading.value = true;

  const { error } = await attractionService.remove(props.attraction.id);

  if (error) {
    toast.error("Erro ao excluir", error);
    loading.value = false;
    return;
  }

  toast.success(
    "Ponto turístico excluído",
    "O ponto turístico foi excluído com sucesso.",
  );
  visible.value = false;
  loading.value = false;

  emit("deleted");
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
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
      Deseja realmente excluir o ponto turístico
      <strong class="text-white">{{ attraction?.name }}</strong
      >?
    </p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="visible = false"
        />

        <Button
          label="Excluir"
          severity="danger"
          :loading="loading"
          @click="handleDelete"
        />
      </div>
    </template>
  </Dialog>
</template>
```

---

### Task 8: AttractionsPage

**Files:**
- Create: `src/pages/AttractionsPage.vue`

- [ ] **Step 1: Create AttractionsPage.vue**

```vue
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
```

---

### Task 9: Router and Navigation

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/layouts/DashboardLayout.vue`

- [ ] **Step 1: Update router to add city and attraction routes**

In `src/router/index.ts`, add the imports at the top (after existing imports):

```typescript
import CitiesPage from "@/pages/CitiesPage.vue";
import AttractionsPage from "@/pages/AttractionsPage.vue";
```

Add two new children inside the `/dashboard` route's `children` array, before the `routes` entry:

```typescript
        {
          path: "cities",
          name: "dashboard-cities",
          component: CitiesPage,
        },
        {
          path: "attractions",
          name: "dashboard-attractions",
          component: AttractionsPage,
        },
```

- [ ] **Step 2: Update DashboardLayout navigation**

In `src/layouts/DashboardLayout.vue`, update the `navigationSections` array to add Cidades and Pontos Turísticos under "Turismo":

```typescript
const navigationSections = [
  {
    title: "Turismo",
    items: [
      {
        label: "Cidades",
        icon: "pi pi-building",
        to: { name: "dashboard-cities" },
      },
      {
        label: "Pontos Turísticos",
        icon: "pi pi-map-marker",
        to: { name: "dashboard-attractions" },
      },
      {
        label: "Rotas",
        icon: "pi pi-map",
        to: { name: "dashboard-routes" },
      },
    ],
  },
  {
    title: "Administração",
    items: [
      {
        label: "Usuários",
        icon: "pi pi-users",
        to: { name: "dashboard-users" },
      },
    ],
  },
];
```

- [ ] **Step 3: Verify the app compiles**

Run: `npm run build`
Expected: No TypeScript or build errors.
