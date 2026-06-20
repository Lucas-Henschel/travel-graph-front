<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
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
import type {
  ConnectionResponse,
  UpdateConnectionRequest,
} from "@/types/connection";

const visible = defineModel<boolean>("visible", { required: true });
const props = defineProps<{ connection: ConnectionResponse | null }>();
const emit = defineEmits<{ updated: [] }>();

const loading = ref(false);
const cities = ref<CityResponse[]>([]);
const toast = useNotification();

const editConnectionSchema = z
  .object({
    originCityId: z.string({ message: "Selecione a cidade de origem." }),
    destinationCityId: z.string({ message: "Selecione a cidade de destino." }),
    distance: z
      .number({ message: "Informe a distância." })
      .positive("A distância deve ser maior que zero."),
    hours: z
      .number({ message: "Informe as horas." })
      .int("Use um número inteiro de horas.")
      .min(0, "As horas não podem ser negativas."),
    minutes: z
      .number({ message: "Informe os minutos." })
      .int("Use um número inteiro de minutos.")
      .min(0, "Os minutos não podem ser negativos.")
      .max(59, "Os minutos devem ser entre 0 e 59."),
  })
  .refine((data) => data.hours + data.minutes > 0, {
    message: "Informe o tempo da conexão.",
    path: ["hours"],
  });

const resolver = zodResolver(editConnectionSchema);

const initialValues = computed(() => {
  const connection = props.connection;

  if (!connection) {
    return { hours: 0, minutes: 0 };
  }

  return {
    originCityId: connection.originCityId,
    destinationCityId: connection.destinationCityId,
    distance: connection.distance,
    hours: Math.floor(connection.time),
    minutes: Math.round((connection.time % 1) * 60),
  };
});

async function fetchCities() {
  const { data } = await cityService.findAll();
  if (data) {
    cities.value = data;
  }
}

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid || !props.connection) return;

  loading.value = true;

  const { originCityId, destinationCityId, distance, hours, minutes } =
    event.values as {
      originCityId: number;
      destinationCityId: number;
      distance: number;
      hours: number;
      minutes: number;
    };

  const payload: UpdateConnectionRequest = {
    originCityId,
    destinationCityId,
    distance,
    time: hours + minutes / 60,
  };

  const { error } = await connectionService.update(
    props.connection.id,
    payload,
  );

  if (error) {
    toast.error("Erro ao salvar", error);
    loading.value = false;
    return;
  }

  toast.success("Conexão atualizada", "A conexão foi atualizada com sucesso.");
  visible.value = false;
  loading.value = false;

  emit("updated");
}

onMounted(fetchCities);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Editar conexão"
    modal
    :style="{ width: '28rem' }"
    :pt="{
      root: { class: '!bg-slate-900 !border !border-white/10' },
      header: { class: '!bg-slate-900 !text-white' },
      content: { class: '!bg-slate-900' },
    }"
  >
    <Form
      :key="connection?.id"
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="handleSubmit"
    >
      <div class="flex flex-col gap-5">
        <div class="space-y-2">
          <FloatLabel variant="in">
            <Select
              id="edit-connection-origin"
              name="originCityId"
              :options="cities"
              optionLabel="name"
              optionValue="id"
              fluid
              disabled
              :invalid="$form.originCityId?.invalid"
            />
            <label for="edit-connection-origin">Cidade de origem</label>
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
              id="edit-connection-destination"
              name="destinationCityId"
              :options="cities"
              optionLabel="name"
              optionValue="id"
              fluid
              disabled
              :invalid="$form.destinationCityId?.invalid"
            />
            <label for="edit-connection-destination">Cidade de destino</label>
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
              id="edit-connection-distance"
              name="distance"
              fluid
              :minFractionDigits="1"
              :maxFractionDigits="2"
              suffix=" km"
              :invalid="$form.distance?.invalid"
            />
            <label for="edit-connection-distance">Distância (km)</label>
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
          <div class="flex gap-2">
            <div class="flex-1">
              <FloatLabel variant="in">
                <InputNumber
                  id="edit-connection-hours"
                  name="hours"
                  fluid
                  :min="0"
                  :useGrouping="false"
                  showButtons
                  buttonLayout="horizontal"
                  suffix=" h"
                  :invalid="$form.hours?.invalid"
                />
                <label for="edit-connection-hours">Horas</label>
              </FloatLabel>
            </div>
            <div class="flex-1">
              <FloatLabel variant="in">
                <InputNumber
                  id="edit-connection-minutes"
                  name="minutes"
                  fluid
                  :min="0"
                  :max="59"
                  :useGrouping="false"
                  showButtons
                  buttonLayout="horizontal"
                  suffix=" min"
                  :invalid="$form.minutes?.invalid"
                />
                <label for="edit-connection-minutes">Minutos</label>
              </FloatLabel>
            </div>
          </div>

          <Message
            v-if="$form.hours?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.hours.error?.message }}
          </Message>
          <Message
            v-if="$form.minutes?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.minutes.error?.message }}
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
        <Button label="Salvar" type="submit" :loading="loading" />
      </div>
    </Form>
  </Dialog>
</template>
