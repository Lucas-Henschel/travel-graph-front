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
