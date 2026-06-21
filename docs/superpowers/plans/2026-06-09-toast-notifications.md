# Toast Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all inline `Message` feedback and add toast notifications where feedback is silent, using PrimeVue's `Toast` with a `useNotification()` composable.

**Architecture:** Register `ToastService` globally, render a single `<Toast />` in `App.vue`, and expose a `useNotification()` composable that wraps `useToast()` with convenience methods (`success`, `error`, `warn`, `info`). Each page/layout calls the composable and fires toasts in its try/catch blocks.

**Tech Stack:** Vue 3, PrimeVue 4 (Toast, ToastService), Pinia, TypeScript

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/main.ts` | Modify | Register `ToastService` plugin |
| `src/App.vue` | Modify | Add global `<Toast />` component |
| `src/composables/useNotification.ts` | Create | Composable wrapping `useToast()` |
| `src/pages/LoginPage.vue` | Modify | Replace inline `Message` with toast calls |
| `src/pages/UsersPage.vue` | Modify | Replace inline `Message` + add missing toasts |
| `src/layouts/DashboardLayout.vue` | Modify | Add logout toast |

---

### Task 1: Register ToastService and add global Toast component

**Files:**
- Modify: `src/main.ts:3-4` (add import and plugin registration)
- Modify: `src/App.vue` (add Toast component)

- [ ] **Step 1: Register ToastService in main.ts**

Add the import after the existing PrimeVue import (line 3) and register the plugin after `app.use(PrimeVue, ...)` (after line 19):

```ts
import ToastService from "primevue/toastservice";
```

```ts
app.use(ToastService);
```

The final order should be: `app.use(pinia)`, `app.use(PrimeVue, {...})`, `app.use(ToastService)`, then `useAuthStore`, then `app.use(router)`.

- [ ] **Step 2: Add Toast to App.vue**

Replace the current template with:

```vue
<script setup lang="ts">
import Toast from "primevue/toast";
</script>

<template>
  <Toast />
  <router-view />
</template>
```

- [ ] **Step 3: Verify the app starts without errors**

Run: `npm run dev`
Expected: App loads normally, no console errors. Toast component is invisible (no toasts fired yet).

- [ ] **Step 4: Commit**

```bash
git add src/main.ts src/App.vue
git commit -m "feat: register ToastService and add global Toast component"
```

---

### Task 2: Create useNotification composable

**Files:**
- Create: `src/composables/useNotification.ts`

- [ ] **Step 1: Create the composable file**

Create `src/composables/useNotification.ts` with this content:

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

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx vue-tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/composables/useNotification.ts
git commit -m "feat: create useNotification composable"
```

---

### Task 3: Replace LoginPage inline Messages with toasts

**Files:**
- Modify: `src/pages/LoginPage.vue`

- [ ] **Step 1: Update the script section**

Remove these lines:
- `import Message from "primevue/message";` (line 9)
- `const errorMessage = ref<string | null>(null);` (line 21)

Add this import at the top of the script:
```ts
import { useNotification } from "@/composables/useNotification";
```

Add after the existing store/router declarations:
```ts
const toast = useNotification();
```

- [ ] **Step 2: Update handleSubmit to use toasts**

Replace the entire `handleSubmit` function with:

```ts
async function handleSubmit(event: FormSubmitEvent) {
  loading.value = true;

  try {
    const response = await authService.login(
      event.values as LoginCredentials,
    );

    authStore.setSession(response.token, response.currentUser);
    toast.success("Bem-vindo!", "Login realizado com sucesso.");
    await router.push("/dashboard");
  } catch (err: unknown) {
    const status =
      err &&
      typeof err === "object" &&
      "response" in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    toast.error(
      "Erro de autenticação",
      status === 422
        ? "E-mail ou senha inválidos."
        : "Erro ao conectar com o servidor.",
    );
  } finally {
    loading.value = false;
  }
}
```

- [ ] **Step 3: Remove the inline Message from the template**

Remove this block from the template (between the closing `</div>` of the header and the `<Form>`):

```vue
<Message v-if="errorMessage" severity="error" :closable="false">
  {{ errorMessage }}
</Message>
```

- [ ] **Step 4: Clean up unused ref import**

The `ref` import on line 2 is still needed for `loading`, so keep it. But `errorMessage` ref was removed in step 1 — verify it's gone.

- [ ] **Step 5: Verify the login page works**

Run: `npm run dev`
Test: Navigate to login page. Submit with wrong credentials — an error toast should appear. Submit with correct credentials — a success toast should appear briefly before redirect.

- [ ] **Step 6: Commit**

```bash
git add src/pages/LoginPage.vue
git commit -m "feat: replace LoginPage inline messages with toasts"
```

---

### Task 4: Replace UsersPage inline Messages and add missing toasts

**Files:**
- Modify: `src/pages/UsersPage.vue`

- [ ] **Step 1: Update imports and declarations**

Remove this import:
```ts
import Message from "primevue/message";
```

Add this import:
```ts
import { useNotification } from "@/composables/useNotification";
```

Remove this ref declaration:
```ts
const dialogError = ref<string | null>(null);
```

Add after the existing ref declarations:
```ts
const toast = useNotification();
```

- [ ] **Step 2: Update fetchUsers to show error toast**

Replace the `fetchUsers` function with:

```ts
async function fetchUsers() {
  loading.value = true;
  try {
    users.value = await userService.findAll();
  } catch {
    users.value = [];
    toast.error("Erro ao carregar", "Não foi possível carregar os usuários.");
  } finally {
    loading.value = false;
  }
}
```

- [ ] **Step 3: Update openCreateDialog — remove dialogError reset**

Replace the `openCreateDialog` function with:

```ts
function openCreateDialog() {
  dialogMode.value = "create";
  formName.value = "";
  formEmail.value = "";
  formPassword.value = "";
  editingUserId.value = null;
  dialogVisible.value = true;
}
```

- [ ] **Step 4: Update openEditDialog — remove dialogError reset**

Replace the `openEditDialog` function with:

```ts
function openEditDialog(user: UserResponse) {
  dialogMode.value = "edit";
  formName.value = user.name;
  formEmail.value = user.email;
  formPassword.value = "";
  editingUserId.value = user.id;
  dialogVisible.value = true;
}
```

- [ ] **Step 5: Update handleSave with success and error toasts**

Replace the `handleSave` function with:

```ts
async function handleSave() {
  dialogLoading.value = true;

  try {
    if (dialogMode.value === "create") {
      const payload: CreateUserRequest = {
        name: formName.value,
        email: formEmail.value,
        password: formPassword.value,
      };
      await userService.create(payload);
      toast.success("Usuário criado", "O usuário foi criado com sucesso.");
    } else if (editingUserId.value) {
      const payload: UpdateUserRequest = {
        name: formName.value,
        email: formEmail.value,
        password: formPassword.value,
      };
      await userService.update(editingUserId.value, payload);
      toast.success("Usuário atualizado", "O usuário foi atualizado com sucesso.");
    }

    dialogVisible.value = false;
    await fetchUsers();
  } catch {
    toast.error("Erro ao salvar", "Não foi possível salvar o usuário.");
  } finally {
    dialogLoading.value = false;
  }
}
```

- [ ] **Step 6: Update handleDelete with success and error toasts**

Replace the `handleDelete` function with:

```ts
async function handleDelete() {
  if (!deletingUser.value) return;

  deleteLoading.value = true;

  try {
    await userService.remove(deletingUser.value.id);
    deleteDialogVisible.value = false;
    toast.success("Usuário excluído", "O usuário foi excluído com sucesso.");
    await fetchUsers();
  } catch {
    toast.error("Erro ao excluir", "Não foi possível excluir o usuário.");
  } finally {
    deleteLoading.value = false;
  }
}
```

- [ ] **Step 7: Remove the inline Message from the dialog template**

Remove this block from the Create/Edit Dialog template (right after the opening `</Dialog>` content, before the form fields):

```vue
<Message v-if="dialogError" severity="error" :closable="false" class="mb-4">
  {{ dialogError }}
</Message>
```

- [ ] **Step 8: Verify UsersPage works**

Run: `npm run dev`
Test:
- Create a user — success toast appears, dialog closes
- Edit a user — success toast appears, dialog closes
- Delete a user — success toast appears, confirm dialog closes
- Force an error (e.g. disconnect API) — error toasts appear for each operation

- [ ] **Step 9: Commit**

```bash
git add src/pages/UsersPage.vue
git commit -m "feat: replace UsersPage inline messages with toasts and add missing feedback"
```

---

### Task 5: Add logout toast to DashboardLayout

**Files:**
- Modify: `src/layouts/DashboardLayout.vue`

- [ ] **Step 1: Add import and composable**

Add this import at the top of the script:
```ts
import { useNotification } from "@/composables/useNotification";
```

Add after the existing store/router declarations:
```ts
const toast = useNotification();
```

- [ ] **Step 2: Update handleLogout to show toast**

Replace the `handleLogout` function with:

```ts
async function handleLogout() {
  await authService.logout();
  authStore.clearSession();
  toast.success("Sessão encerrada", "Você foi desconectado com sucesso.");
  router.push({ name: "login" });
}
```

- [ ] **Step 3: Verify logout works**

Run: `npm run dev`
Test: Log in, then click the logout button. A success toast should briefly appear before/during the redirect to login.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/DashboardLayout.vue
git commit -m "feat: add logout success toast to DashboardLayout"
```

---

### Task 6: Final verification

- [ ] **Step 1: Run TypeScript check**

Run: `npx vue-tsc --noEmit`
Expected: No type errors.

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No lint errors.

- [ ] **Step 3: Full manual smoke test**

Run: `npm run dev`

Test all flows:
1. Login with wrong credentials → error toast
2. Login with correct credentials → success toast + redirect
3. Users page loads → no toast (happy path) or error toast (if API down)
4. Create user → success toast + dialog closes
5. Edit user → success toast + dialog closes
6. Delete user → confirm dialog → success toast
7. Logout → success toast + redirect to login

- [ ] **Step 4: Verify no leftover Message imports**

Run: `grep -r "from \"primevue/message\"" src/`
Expected: No results (all Message imports have been removed).
