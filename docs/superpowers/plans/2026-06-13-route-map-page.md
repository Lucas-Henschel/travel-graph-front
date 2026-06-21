# Route Map Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new page at `/dashboard/routes` with an interactive Leaflet map where users can select two cities, calculate the shortest route (via mock Dijkstra), and visualize the path with markers and polylines.

**Architecture:** Types define the domain model. Mock data provides cities, connections, and tourist points with a Dijkstra implementation. A service layer wraps the mock (swappable for real API later). The RoutesPage component mounts a full-page Leaflet map with a floating control panel for search and results.

**Tech Stack:** Vue 3, Leaflet via `@vue-leaflet/vue-leaflet`, PrimeVue (Dropdown, SelectButton, Button), Tailwind CSS, TypeScript

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/types/route.ts` | Domain types for cities, tourist points, connections, route response |
| Create | `src/mocks/routesMock.ts` | Mock data (cities, connections, tourist points) + Dijkstra algorithm |
| Create | `src/services/routeService.ts` | Service layer wrapping mock data, matching ServiceResult pattern |
| Create | `src/pages/RoutesPage.vue` | Main page: full-page Leaflet map + floating search/results panel |
| Modify | `src/router/index.ts` | Add `/dashboard/routes` route |
| Modify | `src/layouts/DashboardLayout.vue` | Add "Rotas" nav item to sidebar |
| Modify | `src/styles/main.css` | Add Leaflet CSS import and dark theme overrides |

---

### Task 1: Install dependencies

**Files:** `package.json`

- [ ] **Step 1: Install Leaflet and vue-leaflet**

```bash
npm install leaflet @vue-leaflet/vue-leaflet
```

- [ ] **Step 2: Install Leaflet type definitions**

```bash
npm install -D @types/leaflet
```

- [ ] **Step 3: Verify the dev server still starts**

```bash
npm run dev
```

Expected: Vite dev server starts without errors.

---

### Task 2: Create route types

**Files:**
- Create: `src/types/route.ts`

- [ ] **Step 1: Create the types file**

```ts
export interface Cidade {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
}

export interface PontoTuristico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  cidadeId: number;
}

export interface Conexao {
  cidadeOrigemId: number;
  cidadeDestinoId: number;
  distancia: number;
  tempo: number;
}

export interface CidadeRota {
  nome: string;
  latitude: number;
  longitude: number;
  pontosTuristicos: PontoTuristico[];
}

export interface RotaResponse {
  cidades: CidadeRota[];
  distanciaTotal: number;
  tempoTotal: number;
}
```

---

### Task 3: Create mock data with Dijkstra

**Files:**
- Create: `src/mocks/routesMock.ts`

- [ ] **Step 1: Create the mock data file with cities, connections, tourist points, and Dijkstra**

```ts
import type {
  Cidade,
  Conexao,
  PontoTuristico,
  RotaResponse,
  CidadeRota,
} from "@/types/route";

export const cidadesMock: Cidade[] = [
  { id: 1, nome: "Florianópolis", latitude: -27.5954, longitude: -48.548 },
  { id: 2, nome: "Curitiba", latitude: -25.4284, longitude: -49.2733 },
  { id: 3, nome: "São Paulo", latitude: -23.5505, longitude: -46.6333 },
  { id: 4, nome: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729 },
  { id: 5, nome: "Brasília", latitude: -15.7975, longitude: -47.8919 },
  { id: 6, nome: "Belo Horizonte", latitude: -19.9167, longitude: -43.9345 },
];

export const conexoesMock: Conexao[] = [
  { cidadeOrigemId: 1, cidadeDestinoId: 2, distancia: 300, tempo: 4.5 },
  { cidadeOrigemId: 2, cidadeDestinoId: 3, distancia: 408, tempo: 5.5 },
  { cidadeOrigemId: 3, cidadeDestinoId: 4, distancia: 429, tempo: 5.5 },
  { cidadeOrigemId: 3, cidadeDestinoId: 6, distancia: 586, tempo: 7 },
  { cidadeOrigemId: 4, cidadeDestinoId: 6, distancia: 434, tempo: 5.5 },
  { cidadeOrigemId: 6, cidadeDestinoId: 5, distancia: 716, tempo: 8.5 },
  { cidadeOrigemId: 3, cidadeDestinoId: 5, distancia: 1015, tempo: 12 },
  { cidadeOrigemId: 2, cidadeDestinoId: 1, distancia: 300, tempo: 4.5 },
  { cidadeOrigemId: 3, cidadeDestinoId: 2, distancia: 408, tempo: 5.5 },
  { cidadeOrigemId: 4, cidadeDestinoId: 3, distancia: 429, tempo: 5.5 },
  { cidadeOrigemId: 6, cidadeDestinoId: 3, distancia: 586, tempo: 7 },
  { cidadeOrigemId: 6, cidadeDestinoId: 4, distancia: 434, tempo: 5.5 },
  { cidadeOrigemId: 5, cidadeDestinoId: 6, distancia: 716, tempo: 8.5 },
  { cidadeOrigemId: 5, cidadeDestinoId: 3, distancia: 1015, tempo: 12 },
];

export const pontosTuristicosMock: PontoTuristico[] = [
  { id: 1, nome: "Ponte Hercílio Luz", descricao: "Cartão postal de Florianópolis, ponte pênsil histórica.", categoria: "Histórico", cidadeId: 1 },
  { id: 2, nome: "Praia da Joaquina", descricao: "Famosa praia com dunas e surf.", categoria: "Praia", cidadeId: 1 },
  { id: 3, nome: "Jardim Botânico", descricao: "Jardim botânico com estufa de vidro art nouveau.", categoria: "Natureza", cidadeId: 2 },
  { id: 4, nome: "Museu Oscar Niemeyer", descricao: "Museu de arte com arquitetura icônica em formato de olho.", categoria: "Museu", cidadeId: 2 },
  { id: 5, nome: "Avenida Paulista", descricao: "Principal avenida cultural e financeira de São Paulo.", categoria: "Urbano", cidadeId: 3 },
  { id: 6, nome: "Parque Ibirapuera", descricao: "Maior parque urbano de São Paulo.", categoria: "Natureza", cidadeId: 3 },
  { id: 7, nome: "MASP", descricao: "Museu de Arte de São Paulo, acervo europeu importante.", categoria: "Museu", cidadeId: 3 },
  { id: 8, nome: "Cristo Redentor", descricao: "Estátua icônica no topo do Corcovado.", categoria: "Histórico", cidadeId: 4 },
  { id: 9, nome: "Pão de Açúcar", descricao: "Complexo de morros com bondinho e vista panorâmica.", categoria: "Natureza", cidadeId: 4 },
  { id: 10, nome: "Catedral de Brasília", descricao: "Catedral com arquitetura modernista de Niemeyer.", categoria: "Histórico", cidadeId: 5 },
  { id: 11, nome: "Congresso Nacional", descricao: "Sede do poder legislativo com torres gêmeas.", categoria: "Histórico", cidadeId: 5 },
  { id: 12, nome: "Praça da Liberdade", descricao: "Conjunto arquitetônico com museus e jardins.", categoria: "Urbano", cidadeId: 6 },
  { id: 13, nome: "Mercado Central", descricao: "Mercado tradicional com comida mineira e artesanato.", categoria: "Urbano", cidadeId: 6 },
];

type Criterio = "distancia" | "tempo";

export function calcularRotaMock(
  origemId: number,
  destinoId: number,
  criterio: Criterio,
): RotaResponse | null {
  const cidadeMap = new Map(cidadesMock.map((c) => [c.id, c]));

  if (!cidadeMap.has(origemId) || !cidadeMap.has(destinoId)) return null;
  if (origemId === destinoId) return null;

  const adj = new Map<number, { vizinho: number; peso: number }[]>();
  const distanciaMap = new Map<string, { distancia: number; tempo: number }>();

  for (const c of cidadesMock) {
    adj.set(c.id, []);
  }

  for (const con of conexoesMock) {
    const peso = criterio === "distancia" ? con.distancia : con.tempo;
    adj.get(con.cidadeOrigemId)!.push({ vizinho: con.cidadeDestinoId, peso });

    const key = [Math.min(con.cidadeOrigemId, con.cidadeDestinoId), Math.max(con.cidadeOrigemId, con.cidadeDestinoId)].join("-");
    if (!distanciaMap.has(key)) {
      distanciaMap.set(key, { distancia: con.distancia, tempo: con.tempo });
    }
  }

  const dist = new Map<number, number>();
  const prev = new Map<number, number | null>();
  const visited = new Set<number>();

  for (const c of cidadesMock) {
    dist.set(c.id, Infinity);
    prev.set(c.id, null);
  }
  dist.set(origemId, 0);

  while (true) {
    let u: number | null = null;
    let minDist = Infinity;

    for (const [id, d] of dist) {
      if (!visited.has(id) && d < minDist) {
        minDist = d;
        u = id;
      }
    }

    if (u === null || u === destinoId) break;
    visited.add(u);

    for (const { vizinho, peso } of adj.get(u)!) {
      if (visited.has(vizinho)) continue;
      const alt = dist.get(u)! + peso;
      if (alt < dist.get(vizinho)!) {
        dist.set(vizinho, alt);
        prev.set(vizinho, u);
      }
    }
  }

  if (dist.get(destinoId) === Infinity) return null;

  const path: number[] = [];
  let current: number | null = destinoId;
  while (current !== null) {
    path.unshift(current);
    current = prev.get(current)!;
  }

  let distanciaTotal = 0;
  let tempoTotal = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const key = [Math.min(path[i], path[i + 1]), Math.max(path[i], path[i + 1])].join("-");
    const edge = distanciaMap.get(key)!;
    distanciaTotal += edge.distancia;
    tempoTotal += edge.tempo;
  }

  const cidades: CidadeRota[] = path.map((id) => {
    const cidade = cidadeMap.get(id)!;
    return {
      nome: cidade.nome,
      latitude: cidade.latitude,
      longitude: cidade.longitude,
      pontosTuristicos: pontosTuristicosMock.filter((p) => p.cidadeId === id),
    };
  });

  return { cidades, distanciaTotal, tempoTotal };
}
```

---

### Task 4: Create route service

**Files:**
- Create: `src/services/routeService.ts`

- [ ] **Step 1: Create the service with mock backing**

```ts
import type { ServiceResult } from "@/types/api";
import type { Cidade, RotaResponse } from "@/types/route";
import { cidadesMock, calcularRotaMock } from "@/mocks/routesMock";

export const routeService = {
  async listarCidades(): Promise<ServiceResult<Cidade[]>> {
    // TODO: swap for api.get<Cidade[]>("/cidades") when backend is ready
    return { data: cidadesMock, error: null };
  },

  async calcularRota(
    origemId: number,
    destinoId: number,
    criterio: "distancia" | "tempo",
  ): Promise<ServiceResult<RotaResponse>> {
    // TODO: swap for api.get<RotaResponse>(`/rotas?origem=${origemId}&destino=${destinoId}&criterio=${criterio}`) when backend is ready
    const result = calcularRotaMock(origemId, destinoId, criterio);

    if (!result) {
      return { data: null, error: "Nenhuma rota encontrada entre as cidades selecionadas." };
    }

    return { data: result, error: null };
  },
};
```

---

### Task 5: Create the RoutesPage component

**Files:**
- Create: `src/pages/RoutesPage.vue`

- [ ] **Step 1: Create the full RoutesPage component**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPolyline,
  LPopup,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import L from "leaflet";
import Dropdown from "primevue/dropdown";
import SelectButton from "primevue/selectbutton";
import Button from "primevue/button";

import { useNotification } from "@/composables/useNotification";
import { routeService } from "@/services/routeService";
import type { Cidade, RotaResponse } from "@/types/route";

const toast = useNotification();

const cidades = ref<Cidade[]>([]);
const origemId = ref<number | null>(null);
const destinoId = ref<number | null>(null);
const criterio = ref<"distancia" | "tempo">("distancia");
const criterioOptions = [
  { label: "Distância", value: "distancia" },
  { label: "Tempo", value: "tempo" },
];
const loading = ref(false);
const rota = ref<RotaResponse | null>(null);

const mapRef = ref<InstanceType<typeof LMap> | null>(null);
const center = ref<[number, number]>([-15.7, -47.9]);
const zoom = ref(5);

const canCalculate = computed(
  () =>
    origemId.value !== null &&
    destinoId.value !== null &&
    origemId.value !== destinoId.value,
);

const polylineLatLngs = computed(() => {
  if (!rota.value) return [];
  return rota.value.cidades.map(
    (c) => [c.latitude, c.longitude] as [number, number],
  );
});

function markerColor(index: number, total: number): string {
  if (index === 0) return "green";
  if (index === total - 1) return "red";
  return "blue";
}

function createIcon(color: string) {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

const expandedCities = ref<Set<number>>(new Set());

function toggleCityExpand(index: number) {
  if (expandedCities.value.has(index)) {
    expandedCities.value.delete(index);
  } else {
    expandedCities.value.add(index);
  }
}

async function fetchCidades() {
  const { data, error } = await routeService.listarCidades();

  if (!data || error) {
    toast.error("Erro ao carregar cidades", error);
    return;
  }

  cidades.value = data;
}

async function calcular() {
  if (!canCalculate.value) return;

  loading.value = true;
  rota.value = null;
  expandedCities.value.clear();

  const { data, error } = await routeService.calcularRota(
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

  if (data.cidades.length > 0) {
    const bounds = L.latLngBounds(
      data.cidades.map((c) => [c.latitude, c.longitude] as [number, number]),
    );
    mapRef.value?.leafletObject?.fitBounds(bounds, { padding: [50, 50] });
  }
}

onMounted(fetchCidades);
</script>

<template>
  <div class="relative -mx-4 -my-6 sm:-mx-6 lg:-mx-8 lg:-my-6" style="height: calc(100vh - 0px)">
    <LMap
      ref="mapRef"
      :center="center"
      :zoom="zoom"
      :use-global-leaflet="false"
      class="h-full w-full"
    >
      <LTileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        layer-type="base"
      />

      <template v-if="rota">
        <LPolyline
          :lat-lngs="polylineLatLngs"
          :color="'#22d3ee'"
          :weight="4"
          :opacity="0.8"
        />

        <LMarker
          v-for="(cidade, index) in rota.cidades"
          :key="index"
          :lat-lng="[cidade.latitude, cidade.longitude]"
          :icon="createIcon(markerColor(index, rota.cidades.length))"
        >
          <LTooltip>{{ cidade.nome }}</LTooltip>
          <LPopup>
            <div class="min-w-[200px]">
              <h3 class="text-sm font-bold text-white mb-1">{{ cidade.nome }}</h3>
              <p v-if="cidade.pontosTuristicos.length" class="text-xs text-slate-400 mb-2">
                {{ cidade.pontosTuristicos.length }} ponto(s) turístico(s)
              </p>
              <ul class="space-y-1">
                <li
                  v-for="ponto in cidade.pontosTuristicos"
                  :key="ponto.id"
                  class="text-xs"
                >
                  <span class="font-medium text-cyan-400">{{ ponto.nome }}</span>
                  <span class="text-slate-400"> - {{ ponto.descricao }}</span>
                </li>
              </ul>
            </div>
          </LPopup>
        </LMarker>
      </template>
    </LMap>

    <div
      class="absolute top-4 left-4 z-[1000] w-80 rounded-2xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-xl"
    >
      <h2 class="mb-4 text-lg font-bold text-white">Buscar Rota</h2>

      <div class="space-y-3">
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

        <SelectButton
          v-model="criterio"
          :options="criterioOptions"
          optionLabel="label"
          optionValue="value"
          class="!w-full"
          :pt="{
            root: { class: '!flex' },
            pcButton: { root: { class: '!flex-1' } },
          }"
        />

        <Button
          label="Calcular Rota"
          icon="pi pi-directions"
          :loading="loading"
          :disabled="!canCalculate"
          class="!w-full"
          @click="calcular"
        />
      </div>

      <div v-if="rota" class="mt-4 border-t border-white/10 pt-4">
        <div class="mb-3 flex gap-4">
          <div class="flex-1 rounded-xl bg-slate-800/60 p-3 text-center">
            <p class="text-xs text-slate-400">Distância</p>
            <p class="text-lg font-bold text-cyan-400">
              {{ rota.distanciaTotal.toLocaleString("pt-BR") }} km
            </p>
          </div>
          <div class="flex-1 rounded-xl bg-slate-800/60 p-3 text-center">
            <p class="text-xs text-slate-400">Tempo</p>
            <p class="text-lg font-bold text-cyan-400">
              {{ rota.tempoTotal.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) }}h
            </p>
          </div>
        </div>

        <h3 class="mb-2 text-sm font-medium text-slate-300">Cidades no caminho</h3>
        <ul class="space-y-1">
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
                :class="expandedCities.has(index) ? 'pi-chevron-up' : 'pi-chevron-down'"
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
                <span class="ml-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                  {{ ponto.categoria }}
                </span>
                <p class="mt-0.5 text-slate-500">{{ ponto.descricao }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
```

---

### Task 6: Register the route and navigation

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/layouts/DashboardLayout.vue`

- [ ] **Step 1: Add RoutesPage import and route to router/index.ts**

In `src/router/index.ts`, add the import at the top with the other page imports:

```ts
import RoutesPage from "@/pages/RoutesPage.vue";
```

Add the route as a child of the `/dashboard` route, after the `dashboard-users` entry:

```ts
{
  path: "routes",
  name: "dashboard-routes",
  component: RoutesPage,
},
```

- [ ] **Step 2: Add "Rotas" navigation item to DashboardLayout.vue**

In `src/layouts/DashboardLayout.vue`, add to the `navigationItems` array after the "Usuários" entry:

```ts
{
  label: "Rotas",
  icon: "pi pi-map",
  to: { name: "dashboard-routes" },
},
```

---

### Task 7: Add Leaflet CSS import to main.css

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add Leaflet CSS import and dark theme overrides at the end of main.css**

Append to `src/styles/main.css`:

```css
@import "leaflet/dist/leaflet.css";

.leaflet-container {
  background: #0f172a;
}

.leaflet-control-zoom a {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
  border-color: #334155 !important;
}

.leaflet-control-zoom a:hover {
  background-color: #334155 !important;
}

.leaflet-control-attribution {
  background-color: rgba(15, 23, 42, 0.7) !important;
  color: #64748b !important;
}

.leaflet-control-attribution a {
  color: #22d3ee !important;
}

.leaflet-popup-content-wrapper {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
  border-radius: 0.75rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
}

.leaflet-popup-tip {
  background-color: #1e293b !important;
}

.leaflet-popup-close-button {
  color: #94a3b8 !important;
}
```

---

### Task 8: Verify in browser

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to `/dashboard/routes`**

Open the browser and go to the routes page.

Expected:
- Map fills the content area with dark CartoDB tiles
- Floating panel appears top-left with two dropdowns, criterion toggle, and calculate button
- "Rotas" appears in the sidebar with a map icon

- [ ] **Step 3: Test route calculation**

1. Select "Florianópolis" as origin
2. Select "Rio de Janeiro" as destination
3. Keep criterion as "Distância"
4. Click "Calcular Rota"

Expected:
- Cyan polyline draws through Florianópolis → Curitiba → São Paulo → Rio de Janeiro
- Green marker on Florianópolis, blue on Curitiba and São Paulo, red on Rio de Janeiro
- Panel shows total distance and time
- City list appears with expandable tourist points
- Map auto-zooms to fit the route

- [ ] **Step 4: Test criterion toggle**

Switch to "Tempo" and recalculate the same route.

Expected: route may change if a different path is shorter by time.

- [ ] **Step 5: Test edge case — same city**

Select the same city for origin and destination.

Expected: "Calcular Rota" button stays disabled.

- [ ] **Step 6: Verify sidebar navigation**

Click "Rotas" in the sidebar, then click "Dashboard", then click "Rotas" again.

Expected: navigation works, map re-renders correctly.
