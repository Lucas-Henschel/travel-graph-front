<script setup lang="ts">
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
import { useAuthStore } from "@/stores/auth";
import { conexoesMock } from "@/mocks/routesMock";
import type { Cidade, RotaResponse } from "@/types/route";

const toast = useNotification();
const authStore = useAuthStore();

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

const viewMode = ref<"mapa" | "grafo">("mapa");
const viewModeOptions = [
  { label: "Mapa", value: "mapa", icon: "pi pi-map" },
  { label: "Grafo", value: "grafo", icon: "pi pi-share-alt" },
];

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

// --- Graph visualization (only route cities + pontos turísticos) ---

const routeCityIds = computed(() => {
  if (!rota.value) return [];
  return rota.value.cidades.map((c) => {
    const city = cidades.value.find((ci) => ci.nome === c.nome);
    return city?.id ?? -1;
  });
});

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

const graphLayouts = computed(() => {
  if (!rota.value) return { nodes: {} };
  const routeCities = rota.value.cidades
    .map((c) => cidades.value.find((ci) => ci.nome === c.nome))
    .filter(Boolean) as Cidade[];

  if (!routeCities.length) return { nodes: {} };

  const lats = routeCities.map((c) => c.latitude);
  const lngs = routeCities.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const rangeLng = maxLng - minLng || 1;
  const rangeLat = maxLat - minLat || 1;
  const sizeX = 600;
  const sizeY = 500;

  const nodes: Record<string, { x: number; y: number }> = {};

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
  return { nodes };
});

const routeEdgeIds = computed(() => {
  const ids = routeCityIds.value;
  const keys = new Set<string>();
  for (let i = 0; i < ids.length - 1; i++) {
    keys.add(`r${ids[i]}-${ids[i + 1]}`);
  }
  return keys;
});

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

function categoriaColor(categoria?: string): string {
  switch (categoria) {
    case "Histórico":
      return "#b45309";
    case "Natureza":
      return "#15803d";
    case "Praia":
      return "#0369a1";
    case "Museu":
      return "#7e22ce";
    case "Urbano":
      return "#475569";
    default:
      return "#334155";
  }
}

const graphConfigs = reactive(
  defineConfigs({
    view: {
      autoPanAndZoomOnLoad: "fit-content",
      layoutHandler: undefined,
    },
    node: {
      normal: {
        type: "circle",
        radius: 20,
        color: "#0e7490",
        strokeWidth: 2,
        strokeColor: "#22d3ee",
      },
      hover: {
        color: "#155e75",
      },
      label: {
        visible: true,
        fontSize: 12,
        color: "#e2e8f0",
        direction: "south",
        margin: 6,
      },
    },
    edge: {
      normal: {
        color: "#22d3ee",
        width: 3,
      },
      hover: {
        color: "#67e8f9",
      },
      label: {
        fontSize: 11,
        color: "#94a3b8",
      },
    },
  }),
);

// --- Data fetching ---

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

  if (viewMode.value === "mapa" && data.cidades.length > 0) {
    const bounds = L.latLngBounds(
      data.cidades.map((c) => [c.latitude, c.longitude] as [number, number]),
    );
    mapRef.value?.leafletObject?.fitBounds(bounds, { padding: [50, 50] });
  }
}

onMounted(fetchCidades);
</script>

<template>
  <div
    class="relative -mx-4 -my-6 sm:-mx-6 lg:-mx-8 lg:-my-6"
    style="height: calc(100vh - 0px)"
  >
    <!-- Map View -->
    <LMap
      v-if="viewMode === 'mapa'"
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
      </template>
    </LMap>

    <!-- Graph View -->
    <div v-else class="h-full w-full bg-slate-950">
      <div v-if="!rota" class="flex h-full items-center justify-center">
        <p class="text-slate-500 text-sm">
          Calcule uma rota para visualizar o grafo.
        </p>
      </div>
      <v-network-graph
        v-else
        class="h-full w-full"
        :nodes="graphNodes"
        :edges="graphEdges"
        :layouts="graphLayouts"
        :configs="graphConfigs"
      >
        <template #override-node="{ nodeId, scale, config, ...slotProps }">
          <circle
            v-if="graphNodes[nodeId]?.type === 'cidade'"
            v-bind="slotProps"
            :r="22 * scale"
            fill="#0e7490"
            stroke="#22d3ee"
            :stroke-width="3 * scale"
          />
          <rect
            v-else
            v-bind="slotProps"
            :x="-14 * scale"
            :y="-14 * scale"
            :width="28 * scale"
            :height="28 * scale"
            :rx="6 * scale"
            :fill="categoriaColor(graphNodes[nodeId]?.categoria)"
            stroke="#475569"
            :stroke-width="1.5 * scale"
          />
        </template>

        <template
          #override-node-label="{
            nodeId,
            scale,
            text,
            x,
            y,
            config,
            textAnchor,
            dominantBaseline,
          }"
        >
          <text
            :x="x"
            :y="y + (graphNodes[nodeId]?.type === 'cidade' ? 30 : 22) * scale"
            :font-size="
              (graphNodes[nodeId]?.type === 'cidade' ? 12 : 10) * scale
            "
            :fill="
              graphNodes[nodeId]?.type === 'cidade' ? '#e2e8f0' : '#94a3b8'
            "
            :font-weight="
              graphNodes[nodeId]?.type === 'cidade' ? 'bold' : 'normal'
            "
            text-anchor="middle"
            dominant-baseline="hanging"
          >
            {{ text }}
          </text>
        </template>

        <template #edge-label="{ edge, ...slotProps }">
          <text
            v-if="edge.label"
            v-bind="slotProps"
            fill="#94a3b8"
            font-size="11"
            text-anchor="middle"
            dominant-baseline="central"
          >
            {{ edge.label }}
          </text>
        </template>

        <template #override-edge="{ edge, edgeId, scale, ...slotProps }">
          <line
            v-if="pontoEdgeIds.has(edgeId)"
            v-bind="slotProps"
            stroke="#475569"
            :stroke-width="1.5 * scale"
            stroke-dasharray="6 4"
          />
        </template>
      </v-network-graph>
    </div>

    <!-- Control Panel -->
    <div
      class="absolute top-4 left-4 z-[1000] w-80 rounded-2xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-xl"
    >
      <div class="mb-4">
        <h1 class="text-lg font-bold text-white">
          Olá, {{ authStore.user?.name }}
        </h1>
        <p class="mt-0.5 text-xs text-slate-400">
          Bem-vindo ao painel do TravelGraph.
        </p>
      </div>

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

        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2 rounded-xl bg-slate-800/60 p-1">
          <button
            v-for="opt in viewModeOptions"
            :key="opt.value"
            class="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="
              viewMode === opt.value
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            "
            @click="viewMode = opt.value as 'mapa' | 'grafo'"
          >
            <i :class="opt.icon" class="text-[11px]" />
            {{ opt.label }}
          </button>
        </div>

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
              {{
                rota.tempoTotal.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })
              }}h
            </p>
          </div>
        </div>

        <h3 class="mb-2 text-sm font-medium text-slate-300">
          Cidades no caminho
        </h3>
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
        </ul>
      </div>
    </div>
  </div>
</template>
