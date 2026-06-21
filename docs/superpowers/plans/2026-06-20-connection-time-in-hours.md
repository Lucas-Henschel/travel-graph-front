# Connection Time in Hours — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate connection `time` from minutes to decimal hours across the front-end, accept input as separate hours + minutes fields, and display it as a human-friendly string ("1h 30min", "45min", "2h").

**Architecture:** Add a shared `formatHours` helper in `src/utils/time.ts` reused by every screen that renders `time`. Replace the single minute input in `CreateConnectionDialog` with two integer inputs (hours, minutes) plus a Zod cross-field refinement, then convert to a single decimal before posting.

**Tech Stack:** Vue 3 (script setup), TypeScript, PrimeVue (`InputNumber`, `Form`), Zod, Tailwind. No test framework is installed — verification is manual via `npm run dev` and `vue-tsc` typecheck (`npm run build`).

**User preferences:**
- **Do not run `git commit` automatically.** The user commits manually. Commit steps below are reminders only — leave the changes staged or unstaged so the user can review.
- The back-end migration (changing `time` to hours and dividing existing rows by 60) is handled in a separate repo and is a prerequisite for the deploy of these front-end changes, but is not part of this plan.

---

## File Structure

- **Create:** `src/utils/time.ts` — pure helper `formatHours(hoursDecimal: number): string` reused everywhere `time` is displayed.
- **Modify:** `src/types/connection.ts` — JSDoc clarifying that `time` is decimal hours.
- **Modify:** `src/components/connections/CreateConnectionDialog.vue` — two inputs, updated schema, payload conversion.
- **Modify:** `src/pages/ConnectionsPage.vue` — render `time` via `formatHours`.
- **Modify:** `src/pages/RoutesPage.vue` — render edge labels and route total via `formatHours`.

---

## Task 1: Create the `formatHours` helper

**Files:**
- Create: `src/utils/time.ts`

- [ ] **Step 1: Create the helper file**

Write `src/utils/time.ts`:

```ts
/**
 * Formats a duration expressed in decimal hours as a human-friendly string.
 *
 * Rules:
 * - `< 1h` → `Xmin`             (e.g. `45min`)
 * - `>= 1h` whole hours → `Xh`  (e.g. `2h`)
 * - `>= 1h` with leftover → `Xh Ymin` (e.g. `1h 30min`)
 * - `0` or negative input    → `0min`
 *
 * The input is rounded to the nearest minute before formatting.
 */
export function formatHours(hoursDecimal: number): string {
  if (!Number.isFinite(hoursDecimal) || hoursDecimal <= 0) {
    return "0min";
  }

  const totalMinutes = Math.round(hoursDecimal * 60);

  if (totalMinutes < 60) {
    return `${totalMinutes}min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds (no new TypeScript errors). If pre-existing errors are present in unrelated files, ensure none reference `src/utils/time.ts`.

- [ ] **Step 3: Stage and remind user to commit (do NOT run `git commit`)**

Run: `git add src/utils/time.ts`
Tell the user the file is staged and let them commit when ready.

---

## Task 2: Document `time` semantics on connection types

**Files:**
- Modify: `src/types/connection.ts`

- [ ] **Step 1: Add JSDoc to both `time` fields**

Replace the contents of `src/types/connection.ts` with:

```ts
export interface ConnectionResponse {
  id: number;
  originCityId: number;
  destinationCityId: number;
  originCityName: string;
  destinationCityName: string;
  distance: number;
  /** Duration in decimal hours (e.g. 1.5 = 1h30min). */
  time: number;
  createdAt: string;
}

export interface CreateConnectionRequest {
  originCityId: number;
  destinationCityId: number;
  distance: number;
  /** Duration in decimal hours (e.g. 1.5 = 1h30min). */
  time: number;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build still succeeds.

- [ ] **Step 3: Stage and remind user to commit**

Run: `git add src/types/connection.ts`

---

## Task 3: Update `CreateConnectionDialog` — split input into hours + minutes

**Files:**
- Modify: `src/components/connections/CreateConnectionDialog.vue`

Reference: the current file lives at `src/components/connections/CreateConnectionDialog.vue` and has a single `InputNumber` bound to `time` at lines ~164–186.

- [ ] **Step 1: Update the Zod schema**

In the `<script setup>` block, locate the `createConnectionSchema` declaration (currently starting at line 26) and replace **only** the `time` validation with two new fields plus a cross-field refinement. The full schema becomes:

```ts
const createConnectionSchema = z
  .object({
    originCityId: z.number({ message: "Selecione a cidade de origem." }),
    destinationCityId: z.number({ message: "Selecione a cidade de destino." }),
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
```

- [ ] **Step 2: Update `initialValues` and the payload conversion**

Replace the `initialValues` constant and the `handleSubmit` function so that `hours`/`minutes` exist in the form state but are converted to a single `time` (in decimal hours) before calling the service.

```ts
const initialValues: Partial<{
  originCityId: number;
  destinationCityId: number;
  distance: number;
  hours: number;
  minutes: number;
}> = {
  hours: 0,
  minutes: 0,
};

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

  const { originCityId, destinationCityId, distance, hours, minutes } =
    event.values as {
      originCityId: number;
      destinationCityId: number;
      distance: number;
      hours: number;
      minutes: number;
    };

  const payload: CreateConnectionRequest = {
    originCityId,
    destinationCityId,
    distance,
    time: hours + minutes / 60,
  };

  const { error } = await connectionService.create(payload);

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
```

- [ ] **Step 3: Replace the time input markup**

In the `<template>` block, locate the existing time input wrapper (currently lines ~164–186, the `div.space-y-2` containing `InputNumber` with `name="time"`) and replace it entirely with two inputs side-by-side:

```vue
<div class="space-y-2">
  <div class="flex gap-2">
    <div class="flex-1">
      <FloatLabel variant="in">
        <InputNumber
          id="create-connection-hours"
          name="hours"
          fluid
          :min="0"
          :useGrouping="false"
          showButtons
          buttonLayout="horizontal"
          suffix=" h"
          :invalid="$form.hours?.invalid"
        />
        <label for="create-connection-hours">Horas</label>
      </FloatLabel>
    </div>
    <div class="flex-1">
      <FloatLabel variant="in">
        <InputNumber
          id="create-connection-minutes"
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
        <label for="create-connection-minutes">Minutos</label>
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
```

- [ ] **Step 4: Typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Manual verification — happy path**

Run: `npm run dev`

1. Open the Conexões page and click "Nova conexão".
2. Pick a Cidade de origem and Cidade de destino.
3. Enter a distance > 0.
4. Set Horas = `1`, Minutos = `30`.
5. Submit. Expect a success toast and the dialog to close.
6. Open the browser DevTools Network tab and confirm the `POST /connections` request body has `"time": 1.5`.

- [ ] **Step 6: Manual verification — validation**

Still with the dev server running:

1. Reopen "Nova conexão" with Horas = `0` and Minutos = `0` (rest filled). Submit. Expect the message "Informe o tempo da conexão." under the Horas input.
2. Try Minutos = `60`. Expect "Os minutos devem ser entre 0 e 59." under Minutos.
3. Try Horas = `-1`. Expect "As horas não podem ser negativas." under Horas.

- [ ] **Step 7: Stage and remind user to commit**

Run: `git add src/components/connections/CreateConnectionDialog.vue`

---

## Task 4: Render `time` in the connections list via `formatHours`

**Files:**
- Modify: `src/pages/ConnectionsPage.vue`

- [ ] **Step 1: Import the helper**

In the `<script setup lang="ts">` block, after the existing imports, add:

```ts
import { formatHours } from "@/utils/time";
```

- [ ] **Step 2: Replace the "Tempo" cell**

Locate the column (currently lines ~144–150):

```vue
<Column field="time" header="Tempo" sortable>
  <template #body="{ data }">
    <span class="text-sm text-slate-400">
      {{ data.time }} min
    </span>
  </template>
</Column>
```

Replace its `#body` template so it uses the helper:

```vue
<Column field="time" header="Tempo" sortable>
  <template #body="{ data }">
    <span class="text-sm text-slate-400">
      {{ formatHours(data.time) }}
    </span>
  </template>
</Column>
```

- [ ] **Step 3: Typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`

1. Open the Conexões page.
2. Create three connections with `1h 30min`, `0h 45min`, and `2h 0min`.
3. Confirm the "Tempo" column shows `1h 30min`, `45min`, and `2h` respectively.

- [ ] **Step 5: Stage and remind user to commit**

Run: `git add src/pages/ConnectionsPage.vue`

---

## Task 5: Render `time` in `RoutesPage` labels and totals via `formatHours`

**Files:**
- Modify: `src/pages/RoutesPage.vue`

- [ ] **Step 1: Import the helper**

In the `<script setup lang="ts">` block, after the existing imports, add:

```ts
import { formatHours } from "@/utils/time";
```

- [ ] **Step 2: Update the Leaflet edge label (around line 123)**

Find:

```ts
const text =
  criterio.value === "distance" ? `${con.distance} km` : `${con.time}h`;
```

Replace with:

```ts
const text =
  criterio.value === "distance"
    ? `${con.distance} km`
    : formatHours(con.time);
```

- [ ] **Step 3: Update the graph edge label (around line 193)**

Find:

```ts
const label = con
  ? criterio.value === "distance"
    ? `${con.distance} km`
    : `${con.time}h`
  : "";
```

Replace with:

```ts
const label = con
  ? criterio.value === "distance"
    ? `${con.distance} km`
    : formatHours(con.time)
  : "";
```

- [ ] **Step 4: Update the route total (around lines 642–651)**

Find:

```vue
<div class="flex-1 rounded-xl bg-slate-800/60 p-3 text-center">
  <p class="text-xs text-slate-400">Tempo</p>
  <p class="text-lg font-bold text-cyan-400">
    {{
      routeTotals.time.toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })
    }}h
  </p>
</div>
```

Replace with:

```vue
<div class="flex-1 rounded-xl bg-slate-800/60 p-3 text-center">
  <p class="text-xs text-slate-400">Tempo</p>
  <p class="text-lg font-bold text-cyan-400">
    {{ formatHours(routeTotals.time) }}
  </p>
</div>
```

- [ ] **Step 5: Typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`

Preconditions: at least three cities and the connections from Task 4 (`1h 30min`, `45min`, `2h`) exist, plus connections between them that form a route.

1. Open the Rotas page.
2. Pick origin/destination cities that traverse at least two connections (e.g. one with `1h 30min` and another with `45min`).
3. Click "Calcular Rota" with the criterio set to `Tempo`.
4. Confirm the edge labels on the map and the graph show values like `1h 30min` and `45min` (not `1.5h`).
5. Confirm the "Tempo" total card shows the sum formatted (e.g. `2h 15min`).
6. Switch the criterio to `Distância` and confirm the labels go back to `Xkm` (distance behavior unchanged).

- [ ] **Step 7: Stage and remind user to commit**

Run: `git add src/pages/RoutesPage.vue`

---

## Task 6: Final regression sweep

**Files:** none (verification only).

- [ ] **Step 1: Run lint and build**

Run: `npm run lint`
Expected: zero warnings (the project uses `--max-warnings 0`).

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 2: Full UI smoke**

Run: `npm run dev`

1. Create a new connection with `0h 30min`. Listing shows `30min`.
2. Create another with `3h 0min`. Listing shows `3h`.
3. Calculate a route mixing both. Edge labels match the connection list. The Tempo total equals the human sum (3h 30min).
4. Edit nothing — only read the values. Old connections migrated by the back-end should now show their original real duration (e.g. a row that previously read `90 min` should now read `1h 30min`).

- [ ] **Step 3: Hand off to user**

Inform the user that all front-end work is done, the changes are staged, and they can commit and merge at their discretion. Remind them that this front-end ships behind the back-end migration that converts `time` to decimal hours.
