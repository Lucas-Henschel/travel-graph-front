# Toast Notifications — Design Spec

## Objetivo

Substituir todos os feedbacks inline (`Message`) e adicionar toasts onde o feedback é silencioso, usando o componente `Toast` do PrimeVue 4 com um composable `useNotification()`.

## Infraestrutura

### 1. `main.ts`

Registrar `ToastService` do PrimeVue:

```ts
import ToastService from "primevue/toastservice";
app.use(ToastService);
```

### 2. `App.vue`

Adicionar instância global do `<Toast />`:

```vue
<template>
  <Toast />
  <router-view />
</template>
```

### 3. `src/composables/useNotification.ts`

Composable wrapper sobre `useToast()`:

```ts
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
```

## Mapeamento de Toasts

### LoginPage

| Ação | Tipo | Summary | Detail |
|---|---|---|---|
| Login OK | `success` | Bem-vindo! | Login realizado com sucesso. |
| Erro 422 | `error` | Erro de autenticação | E-mail ou senha inválidos. |
| Erro servidor | `error` | Erro de autenticação | Erro ao conectar com o servidor. |

**Remoções:** `ref errorMessage`, `<Message>` inline de erro, import de `Message`.

### UsersPage

| Ação | Tipo | Summary | Detail |
|---|---|---|---|
| Criar OK | `success` | Usuário criado | O usuário foi criado com sucesso. |
| Editar OK | `success` | Usuário atualizado | O usuário foi atualizado com sucesso. |
| Salvar erro | `error` | Erro ao salvar | Não foi possível salvar o usuário. |
| Deletar OK | `success` | Usuário excluído | O usuário foi excluído com sucesso. |
| Deletar erro | `error` | Erro ao excluir | Não foi possível excluir o usuário. |
| Fetch erro | `error` | Erro ao carregar | Não foi possível carregar os usuários. |

**Remoções:** `ref dialogError`, `<Message>` inline no dialog, import de `Message`.

### DashboardLayout

| Ação | Tipo | Summary | Detail |
|---|---|---|---|
| Logout | `success` | Sessão encerrada | Você foi desconectado com sucesso. |
