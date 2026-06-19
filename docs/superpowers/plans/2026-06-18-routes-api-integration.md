# Routes API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all mocked data in the routes page with real API calls to the backend, renaming frontend types from Portuguese to English.

**Architecture:** Update `types/route.ts` with English-named interfaces matching backend DTOs, rewrite `routeService.ts` to call real endpoints (`GET /cities`, `POST /routes`), update `RoutesPage.vue` to use new types and fetch connections via `connectionService` for graph edge labels, then delete the mock file.

**Tech Stack:** Vue 3, TypeScript, Axios, Leaflet, v-network-graph, PrimeVue

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/types/route.ts` | Route-related TypeScript interfaces aligned with backend DTOs |
| Modify | `src/services/routeService.ts` | API calls for cities listing and route calculation |
| Modify | `src/pages/RoutesPage.vue` | Route page with map/graph views, now using real data |
| Delete | `src/mocks/routesMock.ts` | Mock data file, no longer needed |

---

### Task 1: Update route types to match backend DTOs

**Files:**
- Modify: `src/types/route.ts`

- [ ] **Step 1: Rewrite `src/types/route.ts` with English-named interfaces**

Replace the entire file content with:

```ts
export interface Attraction {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface CityRoute {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  attractions: Attraction[];
}

export interface RouteResponse {
  cities: CityRoute[];
  totalDistance: number;
  totalTime: number;
}

export interface CalculateRouteRequest {
  startCityId: number;
  endCityId: number;
  criteria: "distance" | "time";
}
```

- [ ] **Step 2: Verify no TypeScript errors from the type change**

Run: `npx vue-tsc --noEmit 2>&1 | head -30`

Expected: Errors in `routeService.ts` and `RoutesPage.vue` referencing old type names (`Cidade`, `RotaResponse`). This is expected — we fix those in the next tasks.

- [ ] **Step 3: Commit**

```bash
git add src/types/route.ts
git commit -m "refactor: rename route types to English matching backend DTOs"
```

---

### Task 2: Rewrite routeService to use real API

**Files:**
- Modify: `src/services/routeService.ts`

- [ ] **Step 1: Rewrite `src/services/routeService.ts` to call real endpoints**

Replace the entire file content with:

```ts
import api, { extractErrorMessage } from "./api";
import type { ServiceResult } from "@/types/api";
import type { CityResponse } from "@/types/city";
import type {
  RouteResponse,
  CalculateRouteRequest,
} from "@/types/route";

export const routeService = {
  async listCities(): Promise<ServiceResult<CityResponse[]>> {
    try {
      const { data } = await api.get<CityResponse[]>("/cities");
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async calculateRoute(
    startCityId: number,
    endCityId: number,
    criteria: "distance" | "time",
  ): Promise<ServiceResult<RouteResponse>> {
    try {
      const payload: CalculateRouteRequest = {
        startCityId,
        endCityId,
        criteria,
      };
      const { data } = await api.post<RouteResponse>("/routes", payload);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },
};
```

Key changes:
- Uses `CityResponse` from `types/city.ts` (reuses existing type instead of duplicating)
- `listCities()` calls `GET /cities`
- `calculateRoute()` calls `POST /routes` with `{ startCityId, endCityId, criteria }`
- Follows same try/catch + `extractErrorMessage` pattern as `cityService.ts`

- [ ] **Step 2: Commit**

```bash
git add src/services/routeService.ts
git commit -m "feat: connect routeService to real API endpoints"
```

---

### Task 3: Update RoutesPage.vue — imports, types, and data fetching

**Files:**
- Modify: `src/pages/RoutesPage.vue`

- [ ] **Step 1: Update the `<script setup>` imports**

Replace lines 1–21 (the imports block) with:

```ts
import { ref, onMounted, computed, reactive } from "vue";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPolyline,
  LPopup,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import L from "leaflet";
import { defineConfigs } from "v-network-graph";
import Dropdown from "primevue/dropdown";
import SelectButton from "primevue/selectbutton";
import Button from "primevue/button";

import { useNotification } from "@/composables/useNotification";
import { routeService } from "@/services/routeService";
import { connectionService } from "@/services/connectionService";
import { useAuthStore } from "@/stores/auth";
import type { CityResponse } from "@/types/city";
import type { ConnectionResponse } from "@/types/connection";
import type { RouteResponse } from "@/types/route";
```

- [ ] **Step 2: Update reactive state declarations**

Replace lines 26–35 (the state variables) with:

```ts
const cidades = ref<CityResponse[]>([]);
const connections = ref<ConnectionResponse[]>([]);
const origemId = ref<number | null>(null);
const destinoId = ref<number | null>(null);
const criterio = ref<"distance" | "time">("distance");
const criterioOptions = [
  { label: "Distância", value: "distance" },
  { label: "Tempo", value: "time" },
];
const loading = ref(false);
const rota = ref<RouteResponse | null>(null);
```

- [ ] **Step 3: Update `fetchCidades` to also fetch connections, and update `calcular`**

Replace the `fetchCidades` function (around line 289) with:

```ts
async function fetchCidades() {
  const [citiesResult, connectionsResult] = await Promise.all([
    routeService.listCities(),
    connectionService.findAll(),
  ]);

  if (!citiesResult.data || citiesResult.error) {
    toast.error("Erro ao carregar cidades", citiesResult.error);
    return;
  }

  if (!connectionsResult.data || connectionsResult.error) {
    toast.error("Erro ao carregar conexões", connectionsResult.error);
    return;
  }

  cidades.value = citiesResult.data;
  connections.value = connectionsResult.data;
}
```

Replace the `calcular` function (around line 300) with:

```ts
async function calcular() {
  if (!canCalculate.value) return;

  loading.value = true;
  rota.value = null;
  expandedCities.value.clear();

  const { data, error } = await routeService.calculateRoute(
    origemId.value!,
    destinoId.value!,
    criterio.value,
  );

  if (!data || error) {
    toast.error("Erro ao calcular rota", error);
    loading.value = false;
    return;
  }

  rota.value = data;
  loading.value = false;

  if (viewMode.value === "mapa" && data.cities.length > 0) {
    const bounds = L.latLngBounds(
      data.cities.map((c) => [c.latitude, c.longitude] as [number, number]),
    );
    mapRef.value?.leafletObject?.fitBounds(bounds, { padding: [50, 50] });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/RoutesPage.vue
git commit -m "refactor: update RoutesPage imports, state, and data fetching for real API"
```

---

### Task 4: Update RoutesPage.vue — computed properties (map + graph)

**Files:**
- Modify: `src/pages/RoutesPage.vue`

- [ ] **Step 1: Update `polylineLatLngs` computed**

Replace:

```ts
const polylineLatLngs = computed(() => {
  if (!rota.value) return [];
  return rota.value.cidades.map(
    (c) => [c.latitude, c.longitude] as [number, number],
  );
});
```

With:

```ts
const polylineLatLngs = computed(() => {
  if (!rota.value) return [];
  return rota.value.cities.map(
    (c) => [c.latitude, c.longitude] as [number, number],
  );
});
```

- [ ] **Step 2: Update `routeCityIds` computed**

Replace:

```ts
const routeCityIds = computed(() => {
  if (!rota.value) return [];
  return rota.value.cidades.map((c) => {
    const city = cidades.value.find((ci) => ci.nome === c.nome);
    return city?.id ?? -1;
  });
});
```

With:

```ts
const routeCityIds = computed(() => {
  if (!rota.value) return [];
  return rota.value.cities.map((c) => c.id);
});
```

(Simplified: `CityRoute` now has `id` directly, no need to look up by name.)

- [ ] **Step 3: Update `graphNodes` computed**

Replace:

```ts
const graphNodes = computed(() => {
  if (!rota.value) return {};
  const nodes: Record<
    string,
    { name: string; type: "cidade" | "ponto"; categoria?: string }
  > = {};
  for (const cidade of rota.value.cidades) {
    const cityData = cidades.value.find((c) => c.nome === cidade.nome);
    if (!cityData) continue;
    nodes[`c${cityData.id}`] = { name: cidade.nome, type: "cidade" };
    for (const ponto of cidade.pontosTuristicos) {
      nodes[`p${ponto.id}`] = {
        name: ponto.nome,
        type: "ponto",
        categoria: ponto.categoria,
      };
    }
  }
  return nodes;
});
```

With:

```ts
const graphNodes = computed(() => {
  if (!rota.value) return {};
  const nodes: Record<
    string,
    { name: string; type: "cidade" | "ponto"; categoria?: string }
  > = {};
  for (const city of rota.value.cities) {
    nodes[`c${city.id}`] = { name: city.name, type: "cidade" };
    for (const attraction of city.attractions) {
      nodes[`p${attraction.id}`] = {
        name: attraction.name,
        type: "ponto",
        categoria: attraction.category,
      };
    }
  }
  return nodes;
});
```

- [ ] **Step 4: Update `graphEdges` computed**

Replace:

```ts
const graphEdges = computed(() => {
  if (!rota.value) return {};
  const edges: Record<
    string,
    { source: string; target: string; label?: string; type: "rota" | "ponto" }
  > = {};
  const ids = routeCityIds.value;

  for (let i = 0; i < ids.length - 1; i++) {
    const con = conexoesMock.find(
      (c) =>
        (c.cidadeOrigemId === ids[i] && c.cidadeDestinoId === ids[i + 1]) ||
        (c.cidadeOrigemId === ids[i + 1] && c.cidadeDestinoId === ids[i]),
    );
    const label = con
      ? criterio.value === "distancia"
        ? `${con.distancia} km`
        : `${con.tempo}h`
      : "";
    edges[`r${ids[i]}-${ids[i + 1]}`] = {
      source: `c${ids[i]}`,
      target: `c${ids[i + 1]}`,
      label,
      type: "rota",
    };
  }

  for (const cidade of rota.value.cidades) {
    const cityData = cidades.value.find((c) => c.nome === cidade.nome);
    if (!cityData) continue;
    for (const ponto of cidade.pontosTuristicos) {
      edges[`pt${ponto.id}`] = {
        source: `c${cityData.id}`,
        target: `p${ponto.id}`,
        type: "ponto",
      };
    }
  }

  return edges;
});
```

With:

```ts
const graphEdges = computed(() => {
  if (!rota.value) return {};
  const edges: Record<
    string,
    { source: string; target: string; label?: string; type: "rota" | "ponto" }
  > = {};
  const ids = routeCityIds.value;

  for (let i = 0; i < ids.length - 1; i++) {
    const con = connections.value.find(
      (c) =>
        (c.originCityId === ids[i] && c.destinationCityId === ids[i + 1]) ||
        (c.originCityId === ids[i + 1] && c.destinationCityId === ids[i]),
    );
    const label = con
      ? criterio.value === "distance"
        ? `${con.distance} km`
        : `${con.time}h`
      : "";
    edges[`r${ids[i]}-${ids[i + 1]}`] = {
      source: `c${ids[i]}`,
      target: `c${ids[i + 1]}`,
      label,
      type: "rota",
    };
  }

  for (const city of rota.value.cities) {
    for (const attraction of city.attractions) {
      edges[`pt${attraction.id}`] = {
        source: `c${city.id}`,
        target: `p${attraction.id}`,
        type: "ponto",
      };
    }
  }

  return edges;
});
```

- [ ] **Step 5: Update `graphLayouts` computed**

Replace:

```ts
const graphLayouts = computed(() => {
  if (!rota.value) return { nodes: {} };
  const routeCities = rota.value.cidades
    .map((c) => cidades.value.find((ci) => ci.nome === c.nome))
    .filter(Boolean) as Cidade[];

  if (!routeCities.length) return { nodes: {} };

  const lats = routeCities.map((c) => c.latitude);
  const lngs = routeCities.map((c) => c.longitude);
```

With:

```ts
const graphLayouts = computed(() => {
  if (!rota.value) return { nodes: {} };
  const routeCities = rota.value.cities;

  if (!routeCities.length) return { nodes: {} };

  const lats = routeCities.map((c) => c.latitude);
  const lngs = routeCities.map((c) => c.longitude);
```

Then, in the same computed, replace the city loop body:

```ts
  for (const cidade of rota.value.cidades) {
    const cityData = cidades.value.find((c) => c.nome === cidade.nome);
    if (!cityData) continue;

    const cx = ((cityData.longitude - minLng) / rangeLng) * sizeX;
    const cy = ((maxLat - cityData.latitude) / rangeLat) * sizeY;
    nodes[`c${cityData.id}`] = { x: cx, y: cy };

    const pontos = cidade.pontosTuristicos;
    const angleStep = pontos.length > 1 ? Math.PI / (pontos.length + 1) : 0;
    const radius = 100;
    for (let i = 0; i < pontos.length; i++) {
      const angle = -Math.PI / 2 + angleStep * (i + 1);
      nodes[`p${pontos[i].id}`] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    }
  }
```

With:

```ts
  for (const city of rota.value.cities) {
    const cx = ((city.longitude - minLng) / rangeLng) * sizeX;
    const cy = ((maxLat - city.latitude) / rangeLat) * sizeY;
    nodes[`c${city.id}`] = { x: cx, y: cy };

    const attractions = city.attractions;
    const angleStep = attractions.length > 1 ? Math.PI / (attractions.length + 1) : 0;
    const radius = 100;
    for (let i = 0; i < attractions.length; i++) {
      const angle = -Math.PI / 2 + angleStep * (i + 1);
      nodes[`p${attractions[i].id}`] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    }
  }
```

- [ ] **Step 6: Update `pontoEdgeIds` computed**

Replace:

```ts
const pontoEdgeIds = computed(() => {
  if (!rota.value) return new Set<string>();
  const keys = new Set<string>();
  for (const cidade of rota.value.cidades) {
    for (const ponto of cidade.pontosTuristicos) {
      keys.add(`pt${ponto.id}`);
    }
  }
  return keys;
});
```

With:

```ts
const pontoEdgeIds = computed(() => {
  if (!rota.value) return new Set<string>();
  const keys = new Set<string>();
  for (const city of rota.value.cities) {
    for (const attraction of city.attractions) {
      keys.add(`pt${attraction.id}`);
    }
  }
  return keys;
});
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/RoutesPage.vue
git commit -m "refactor: update RoutesPage computed properties for new types"
```

---

### Task 5: Update RoutesPage.vue — template

**Files:**
- Modify: `src/pages/RoutesPage.vue`

- [ ] **Step 1: Update map markers template**

In the `<template>` section, replace the map markers block:

```html
        <LMarker
          v-for="(cidade, index) in rota.cidades"
          :key="index"
          :lat-lng="[cidade.latitude, cidade.longitude]"
          :icon="createIcon(markerColor(index, rota.cidades.length))"
        >
          <LTooltip>{{ cidade.nome }}</LTooltip>
          <LPopup>
            <div class="min-w-[200px]">
              <h3 class="text-sm font-bold text-white mb-1">
                {{ cidade.nome }}
              </h3>
              <p
                v-if="cidade.pontosTuristicos.length"
                class="text-xs text-slate-400 mb-2"
              >
                {{ cidade.pontosTuristicos.length }} ponto(s) turístico(s)
              </p>
              <ul class="space-y-1">
                <li
                  v-for="ponto in cidade.pontosTuristicos"
                  :key="ponto.id"
                  class="text-xs"
                >
                  <span class="font-medium text-cyan-400">{{
                    ponto.nome
                  }}</span>
                  <span class="text-slate-400"> - {{ ponto.descricao }}</span>
                </li>
              </ul>
            </div>
          </LPopup>
        </LMarker>
```

With:

```html
        <LMarker
          v-for="(city, index) in rota.cities"
          :key="index"
          :lat-lng="[city.latitude, city.longitude]"
          :icon="createIcon(markerColor(index, rota.cities.length))"
        >
          <LTooltip>{{ city.name }}</LTooltip>
          <LPopup>
            <div class="min-w-[200px]">
              <h3 class="text-sm font-bold text-white mb-1">
                {{ city.name }}
              </h3>
              <p
                v-if="city.attractions.length"
                class="text-xs text-slate-400 mb-2"
              >
                {{ city.attractions.length }} ponto(s) turístico(s)
              </p>
              <ul class="space-y-1">
                <li
                  v-for="attraction in city.attractions"
                  :key="attraction.id"
                  class="text-xs"
                >
                  <span class="font-medium text-cyan-400">{{
                    attraction.name
                  }}</span>
                  <span class="text-slate-400"> - {{ attraction.description }}</span>
                </li>
              </ul>
            </div>
          </LPopup>
        </LMarker>
```

- [ ] **Step 2: Update route summary stats**

Replace:

```html
            <p class="text-lg font-bold text-cyan-400">
              {{ rota.distanciaTotal.toLocaleString("pt-BR") }} km
            </p>
```

With:

```html
            <p class="text-lg font-bold text-cyan-400">
              {{ rota.totalDistance.toLocaleString("pt-BR") }} km
            </p>
```

Replace:

```html
            <p class="text-lg font-bold text-cyan-400">
              {{
                rota.tempoTotal.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })
              }}h
            </p>
```

With:

```html
            <p class="text-lg font-bold text-cyan-400">
              {{
                rota.totalTime.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })
              }}h
            </p>
```

- [ ] **Step 3: Update cities list in sidebar**

Replace:

```html
          <li
            v-for="(cidade, index) in rota.cidades"
            :key="index"
            class="rounded-lg"
          >
            <button
              class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/5"
              @click="toggleCityExpand(index)"
            >
              <span
                class="h-2 w-2 shrink-0 rounded-full"
                :class="{
                  'bg-green-400': index === 0,
                  'bg-red-400': index === rota!.cidades.length - 1,
                  'bg-blue-400': index > 0 && index < rota!.cidades.length - 1,
                }"
              />
              <span class="flex-1 text-white">{{ cidade.nome }}</span>
              <i
                v-if="cidade.pontosTuristicos.length"
                class="pi text-xs text-slate-400"
                :class="
                  expandedCities.has(index)
                    ? 'pi-chevron-up'
                    : 'pi-chevron-down'
                "
              />
            </button>
            <div
              v-if="expandedCities.has(index) && cidade.pontosTuristicos.length"
              class="ml-4 mt-1 mb-1 space-y-1 border-l border-white/10 pl-3"
            >
              <div
                v-for="ponto in cidade.pontosTuristicos"
                :key="ponto.id"
                class="text-xs"
              >
                <span class="font-medium text-cyan-400">{{ ponto.nome }}</span>
                <span
                  class="ml-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
                >
                  {{ ponto.categoria }}
                </span>
                <p class="mt-0.5 text-slate-500">{{ ponto.descricao }}</p>
              </div>
            </div>
          </li>
```

With:

```html
          <li
            v-for="(city, index) in rota.cities"
            :key="index"
            class="rounded-lg"
          >
            <button
              class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/5"
              @click="toggleCityExpand(index)"
            >
              <span
                class="h-2 w-2 shrink-0 rounded-full"
                :class="{
                  'bg-green-400': index === 0,
                  'bg-red-400': index === rota!.cities.length - 1,
                  'bg-blue-400': index > 0 && index < rota!.cities.length - 1,
                }"
              />
              <span class="flex-1 text-white">{{ city.name }}</span>
              <i
                v-if="city.attractions.length"
                class="pi text-xs text-slate-400"
                :class="
                  expandedCities.has(index)
                    ? 'pi-chevron-up'
                    : 'pi-chevron-down'
                "
              />
            </button>
            <div
              v-if="expandedCities.has(index) && city.attractions.length"
              class="ml-4 mt-1 mb-1 space-y-1 border-l border-white/10 pl-3"
            >
              <div
                v-for="attraction in city.attractions"
                :key="attraction.id"
                class="text-xs"
              >
                <span class="font-medium text-cyan-400">{{ attraction.name }}</span>
                <span
                  class="ml-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
                >
                  {{ attraction.category }}
                </span>
                <p class="mt-0.5 text-slate-500">{{ attraction.description }}</p>
              </div>
            </div>
          </li>
```

- [ ] **Step 4: Update Dropdown to use `name` field**

Replace:

```html
        <Dropdown
          v-model="origemId"
          :options="cidades"
          optionLabel="nome"
          optionValue="id"
          placeholder="Cidade de origem"
          filter
          class="!w-full"
        />

        <Dropdown
          v-model="destinoId"
          :options="cidades"
          optionLabel="nome"
          optionValue="id"
          placeholder="Cidade de destino"
          filter
          class="!w-full"
        />
```

With:

```html
        <Dropdown
          v-model="origemId"
          :options="cidades"
          optionLabel="name"
          optionValue="id"
          placeholder="Cidade de origem"
          filter
          class="!w-full"
        />

        <Dropdown
          v-model="destinoId"
          :options="cidades"
          optionLabel="name"
          optionValue="id"
          placeholder="Cidade de destino"
          filter
          class="!w-full"
        />
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/RoutesPage.vue
git commit -m "refactor: update RoutesPage template to use English field names"
```

---

### Task 6: Delete mock file and verify build

**Files:**
- Delete: `src/mocks/routesMock.ts`

- [ ] **Step 1: Delete the mock file**

```bash
rm src/mocks/routesMock.ts
```

- [ ] **Step 2: Check if the mocks directory is empty and can be removed**

```bash
ls src/mocks/
```

If empty, remove it:

```bash
rmdir src/mocks/
```

- [ ] **Step 3: Run TypeScript check to verify no errors**

Run: `npx vue-tsc --noEmit`

Expected: No errors. All references to old types and mock imports have been updated.

- [ ] **Step 4: Run dev server to verify app builds**

Run: `npm run dev`

Expected: Dev server starts without errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove route mocks, all data now served by API"
```
