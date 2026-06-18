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
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import { z } from "zod";

import { useNotification } from "@/composables/useNotification";
import { attractionService } from "@/services/attractionService";
import type {
  AttractionResponse,
  UpdateAttractionRequest,
} from "@/types/attraction";
import { ATTRACTION_CATEGORIES } from "@/types/attraction";

const visible = defineModel<boolean>("visible", { required: true });
const props = defineProps<{ attraction: AttractionResponse | null }>();
const emit = defineEmits<{ updated: [] }>();

const loading = ref(false);
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
                :useGrouping="false"
                locale="en-US"
                :maxFractionDigits="20"
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
                :useGrouping="false"
                locale="en-US"
                :maxFractionDigits="20"
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
