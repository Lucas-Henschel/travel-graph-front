# Edit Connection — Design Spec

**Date:** 2026-06-20
**Status:** Approved

## Goal

Allow users to edit existing connections (origin city, destination city, distance, time) from the Connections page, following the same UX patterns as Create and Delete.

## Backend Contract (out of scope for this repo)

A new endpoint must be implemented on the TravelGraph backend:

```
PUT /connections/{id}
Body: {
  originCityId: number,
  destinationCityId: number,
  distance: number,
  time: number  // decimal hours, e.g. 1.5 = 1h30min
}
Response 200: ConnectionResponse
```

Validation (duplicates, origin ≠ destination, etc.) is handled by the backend; the frontend only relays error messages.

## Frontend Changes

### 1. Types — `src/types/connection.ts`

Add:

```ts
export interface UpdateConnectionRequest {
  originCityId: number;
  destinationCityId: number;
  distance: number;
  /** Duration in decimal hours (e.g. 1.5 = 1h30min). */
  time: number;
}
```

Kept as a separate interface from `CreateConnectionRequest` to make intent explicit and allow future divergence without refactor.

### 2. Service — `src/services/connectionService.ts`

Add `update` method following the existing pattern:

```ts
async update(
  id: number,
  payload: UpdateConnectionRequest,
): Promise<ServiceResult<ConnectionResponse>> {
  try {
    const { data } = await api.put<ConnectionResponse>(
      `/connections/${id}`,
      payload,
    );
    return { data, error: null };
  } catch (err) {
    return { data: null, error: extractErrorMessage(err) };
  }
}
```

Import `UpdateConnectionRequest` alongside the existing imports.

### 3. New Component — `src/components/connections/EditConnectionDialog.vue`

Mirrors `CreateConnectionDialog.vue` structure with these differences:

- **Props:** receives `connection: ConnectionResponse | null` (same pattern as `DeleteConnectionDialog`).
- **Emits:** `updated` (instead of `created`).
- **Header:** "Editar conexão". Submit button label: "Salvar".
- **Initial values:** populated from `connection`:
  - `originCityId`, `destinationCityId`, `distance` → direct copy
  - `time` (decimal hours) split into:
    - `hours = Math.floor(connection.time)`
    - `minutes = Math.round((connection.time % 1) * 60)`
- **Reactivity:** watch the `connection` prop and reset the form values when it changes (so opening the dialog for a different row shows the right data).
- **Submit:** calls `connectionService.update(connection.id, payload)`. Payload assembled the same way as create (`time: hours + minutes / 60`). On success, shows toast "Conexão atualizada" and emits `updated`.
- **Schema:** identical Zod schema to the create dialog (same field rules, same `hours + minutes > 0` refine).

The four form fields (origin, destination, distance, hours/minutes) and their layout are identical to the create dialog.

### 4. Page — `src/pages/ConnectionsPage.vue`

- Add state:
  ```ts
  const editDialogVisible = ref(false);
  ```
- Add handler:
  ```ts
  function openEditDialog(connection: ConnectionResponse) {
    selectedConnection.value = connection;
    editDialogVisible.value = true;
  }
  ```
  (`selectedConnection` is reused between edit and delete.)
- In the "Ações" column, add a pencil button **before** the trash button:
  ```html
  <Button
    icon="pi pi-pencil"
    severity="info"
    text
    rounded
    size="small"
    @click="openEditDialog(data)"
  />
  ```
- Render the new dialog alongside the existing ones:
  ```html
  <EditConnectionDialog
    v-model:visible="editDialogVisible"
    :connection="selectedConnection"
    @updated="fetchConnections"
  />
  ```
- Import `EditConnectionDialog` at the top.

## Error Handling

Same pattern as the other connection dialogs: `useNotification` with `toast.error` (using the message extracted by `extractErrorMessage`) on failure, `toast.success` on success. No client-side duplicate validation — the backend is the source of truth.

## Out of Scope

- Extracting a shared form component between create and edit dialogs. Rule of three: revisit if a third use case appears.
- Client-side validation of duplicate connections or origin = destination.
- Inline-edit on the table row.

## Acceptance

- Pencil button appears in the actions column on the Connections page.
- Clicking it opens a dialog pre-filled with that connection's data.
- Submitting with valid data calls `PUT /connections/{id}` and refreshes the list.
- Submitting with invalid data shows field-level Zod errors; API errors show a toast.
- Cancel/close discards changes; reopening shows fresh data.
