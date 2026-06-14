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
                locale="en-US"
                :maxFractionDigits="20"
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
                locale="en-US"
                :maxFractionDigits="20"
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
