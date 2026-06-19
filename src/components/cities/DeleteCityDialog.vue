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
