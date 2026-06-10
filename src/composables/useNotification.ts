import { useToast } from "primevue/usetoast";

export function useNotification() {
  const toast = useToast();
  const life = 4000;

  return {
    success: (summary: string, detail?: string) =>
      toast.add({ severity: "success", summary, detail, life }),
    error: (summary: string, detail?: string) =>
      toast.add({ severity: "error", summary, detail, life }),
    warn: (summary: string, detail?: string) =>
      toast.add({ severity: "warn", summary, detail, life }),
    info: (summary: string, detail?: string) =>
      toast.add({ severity: "info", summary, detail, life }),
  };
}
