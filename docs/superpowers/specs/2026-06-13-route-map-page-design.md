# Route Map Page Design

## Overview

New page at `/dashboard/routes` (name: `dashboard-routes`) for calculating and visualizing shortest routes between cities on an interactive map. Uses mock data initially so the frontend can be validated independently of the backend.

## Stack

- **Map:** Leaflet via `@vue-leaflet/vue-leaflet` + OpenStreetMap tiles (zero setup, no API key)
- **UI:** PrimeVue components (Dropdown, SelectButton, Button) + Tailwind
- **Theme:** follows existing dark theme (slate-950, cyan accents)

## Layout

Full-page map occupying 100% of the DashboardLayout content area. A floating panel positioned `absolute` top-left over the map with:

- Backdrop blur + dark semi-transparent background (`bg-slate-900/90 backdrop-blur-xl`)
- Rounded corners, border consistent with theme (`border-white/10`)
- Max width ~350px, scrollable if content overflows vertically

### Panel Contents

1. **Dropdown cidade origem** -- PrimeVue Dropdown with `filter` enabled, placeholder "Cidade de origem"
2. **Dropdown cidade destino** -- PrimeVue Dropdown with `filter` enabled, placeholder "Cidade de destino"
3. **Critério toggle** -- PrimeVue SelectButton with options "Distância" and "Tempo", default "Distância"
4. **Botão "Calcular Rota"** -- disabled until both cities are selected

### Results Section (appears after calculation)

Expands below the controls showing:

- **Summary:** distância total (km) and tempo total (horas)
- **City list:** ordered list of cities in the route, each expandable to show its pontos turísticos (nome, descrição, categoria)

## Map Visualization

### Initial State

- Centered on Brazil: lat -15.7, lng -47.9, zoom 5
- No markers or routes

### After Route Calculation

- **Origin marker:** green
- **Destination marker:** red
- **Intermediate city markers:** blue, with city name in tooltip
- **Pontos turísticos:** smaller/differentiated markers, shown when clicking a city marker
- **Route polyline:** cyan color connecting cities in path order
- **fitBounds:** auto-zoom to fit the entire route with padding

## Navigation

New sidebar item in DashboardLayout `navigationItems`:

```ts
{ label: "Rotas", icon: "pi pi-map", to: { name: "dashboard-routes" } }
```

## Types (`src/types/route.ts`)

```ts
interface Cidade {
  id: number
  nome: string
  latitude: number
  longitude: number
}

interface PontoTuristico {
  id: number
  nome: string
  descricao: string
  categoria: string
  cidadeId: number
}

interface Conexao {
  cidadeOrigemId: number
  cidadeDestinoId: number
  distancia: number
  tempo: number
}

interface CidadeRota {
  nome: string
  latitude: number
  longitude: number
  pontosTuristicos: PontoTuristico[]
}

interface RotaResponse {
  cidades: CidadeRota[]
  distanciaTotal: number
  tempoTotal: number
}
```

## Mock Data (`src/mocks/routesMock.ts`)

Cities with real coordinates:

| City | Lat | Lng |
|------|-----|-----|
| Florianópolis | -27.5954 | -48.5480 |
| Curitiba | -25.4284 | -49.2733 |
| São Paulo | -23.5505 | -46.6333 |
| Rio de Janeiro | -22.9068 | -43.1729 |
| Brasília | -15.7975 | -47.8919 |
| Belo Horizonte | -19.9167 | -43.9345 |

Connections between cities with realistic distances (km) and times (hours).

Each city has 2-3 fictional pontos turísticos.

Function `calcularRotaMock(origemId, destinoId, criterio)`:
- Implements Dijkstra in memory over the mock connections
- Returns `RotaResponse` with ordered cities, total distance, total time
- Returns null or throws if no path exists

## Services (`src/services/routeService.ts`)

```ts
async function calcularRota(origemId: number, destinoId: number, criterio: 'distancia' | 'tempo'): Promise<ServiceResult<RotaResponse>>
async function listarCidades(): Promise<ServiceResult<Cidade[]>>
```

Initially backed by mock data. When backend is ready, swap to:
- `GET /rotas?origem={origemId}&destino={destinoId}&criterio={criterio}`
- `GET /cidades`

## Component Structure

- `src/pages/RoutesPage.vue` -- main page component
  - Mounts Leaflet map full-size
  - Contains the floating search/results panel
  - Manages state: selected cities, criterion, route result, loading

## Router

Add to `src/router/index.ts` under dashboard children:

```ts
{
  path: "routes",
  name: "dashboard-routes",
  component: RoutesPage,
}
```

## Out of Scope

- CRUD pages for cidades, pontos turísticos, conexões (future work)
- Real backend integration (swap mock for API when ready)
- Mobile-specific map controls
