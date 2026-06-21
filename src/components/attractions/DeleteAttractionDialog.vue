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
