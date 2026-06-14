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
