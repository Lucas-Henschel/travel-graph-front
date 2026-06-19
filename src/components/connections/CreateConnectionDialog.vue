<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import Select from "primevue/select";
import { z } from "zod";

import { useNotification } from "@/composables/useNotification";
import { cityService } from "@/services/cityService";
import { connectionService } from "@/services/connectionService";
import type { CityResponse } from "@/types/city";
import type { CreateConnectionRequest } from "@/types/connection";

const visible = defineModel<boolean>("visible", { required: true });
const emit = defineEmits<{ created: [] }>();

const loading = ref(false);
const cities = ref<CityResponse[]>([]);
const toast = useNotification();

const createConnectionSchema = z.object({
  originCityId: z.number({ message: "Selecione a cidade de origem." }),
  destinationCityId: z.number({ message: "Selecione a cidade de destino." }),
  distance: z
    .number({ message: "Informe a distância." })
    .positive("A distância deve ser maior que zero."),
  time: z
    .number({ message: "Informe o tempo." })
    .positive("O tempo deve ser maior que zero."),
});

const initialValues: Partial<CreateConnectionRequest> = {};

const resolver = zodResolver(createConnectionSchema);

async function fetchCities() {
  const { data } = await cityService.findAll();
  if (data) {
    cities.value = data;
  }
}

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;

  loading.value = true;

  const { error } = await connectionService.create(
    event.values as CreateConnectionRequest,
  );

  if (error) {
    toast.error("Erro ao salvar", error);
    loading.value = false;
    return;
  }

  toast.success("Conexão criada", "A conexão foi criada com sucesso.");
  visible.value = false;
  loading.value = false;

  emit("created");
}

onMounted(fetchCities);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Nova conexão"
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
            <Select
              id="create-connection-origin"
              name="originCityId"
              :options="cities"
              optionLabel="name"
              optionValue="id"
              fluid
              :invalid="$form.originCityId?.invalid"
            />
            <label for="create-connection-origin">Cidade de origem</label>
          </FloatLabel>

          <Message
            v-if="$form.originCityId?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.originCityId.error?.message }}
          </Message>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="in">
            <Select
              id="create-connection-destination"
              name="destinationCityId"
              :options="cities"
              optionLabel="name"
              optionValue="id"
              fluid
              :invalid="$form.destinationCityId?.invalid"
            />
            <label for="create-connection-destination">Cidade de destino</label>
          </FloatLabel>

          <Message
            v-if="$form.destinationCityId?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.destinationCityId.error?.message }}
          </Message>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="in">
            <InputNumber
              id="create-connection-distance"
              name="distance"
              fluid
              :minFractionDigits="1"
              :maxFractionDigits="2"
              suffix=" km"
              :invalid="$form.distance?.invalid"
            />
            <label for="create-connection-distance">Distância (km)</label>
          </FloatLabel>

          <Message
            v-if="$form.distance?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.distance.error?.message }}
          </Message>
        </div>

        <div class="space-y-2">
          <FloatLabel variant="in">
            <InputNumber
              id="create-connection-time"
              name="time"
              fluid
              :minFractionDigits="1"
              :maxFractionDigits="2"
              suffix=" min"
              :invalid="$form.time?.invalid"
            />
            <label for="create-connection-time">Tempo (min)</label>
          </FloatLabel>

          <Message
            v-if="$form.time?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.time.error?.message }}
          </Message>
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
