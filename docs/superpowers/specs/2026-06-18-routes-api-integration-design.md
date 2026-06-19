# Routes Page API Integration

## Summary

Replace all mocked data in the routes page with real API calls to the backend. Rename frontend types from Portuguese to English to align with backend DTOs.

## Current State

- `routeService.ts` returns hardcoded data from `mocks/routesMock.ts`
- `RoutesPage.vue` imports `conexoesMock` directly for graph edge labels
- Frontend types use Portuguese field names (`nome`, `pontosTuristicos`, `distanciaTotal`)
- Dijkstra algorithm runs entirely in the frontend on mock data

## Target State

- `routeService.ts` calls `GET /cities` and `POST /routes`
- `RoutesPage.vue` uses `connectionService.findAll()` for graph edge labels
- All types aligned with backend DTOs (English field names)
- Route calculation delegated to backend (Neo4j GDS Dijkstra)
- `mocks/routesMock.ts` removed

## Type Changes

### `types/route.ts`

| Before (PT) | After (EN) | Fields |
|---|---|---|
| `Cidade` | `City` | `id, name, latitude, longitude` |
| `PontoTuristico` | `Attraction` | `id, name, description, category` |
| `CidadeRota` | `CityRoute` | `id, name, latitude, longitude, attractions: Attraction[]` |
| `RotaResponse` | `RouteResponse` | `cities: CityRoute[], totalDistance, totalTime` |
| `Conexao` | removed | Use `ConnectionResponse` from `types/connection.ts` instead |

Key differences from current types:
- `CityRoute` gains `id` field (backend includes it, needed for connection matching)
- `Attraction` loses `cidadeId` field (not in backend's route response)
- `Connection` type removed from route types — use existing `ConnectionResponse` from connection module

### Criteria mapping

Frontend UI labels remain in Portuguese but values sent to API change:
- `"distancia"` → `"distance"`
- `"tempo"` → `"time"`

## Service Changes

### `routeService.ts`

```
listarCidades() → api.get<City[]>("/cities")
calcularRota(startCityId, endCityId, criteria) → api.post<RouteResponse>("/routes", { startCityId, endCityId, criteria })
```

- Remove all mock imports
- Follow existing `cityService.ts` pattern (try/catch + `extractErrorMessage`)
- Criteria type changes to `"distance" | "time"`

## Page Changes

### `RoutesPage.vue`

- Rename all field references: `nome` → `name`, `pontosTuristicos` → `attractions`, `descricao` → `description`, `categoria` → `category`, `distanciaTotal` → `totalDistance`, `tempoTotal` → `totalTime`
- Import and use `connectionService.findAll()` to fetch connections on mount
- Replace `conexoesMock` usage in `graphEdges` computed with real connection data
- Update criteria options values: `"distancia"` → `"distance"`, `"tempo"` → `"time"`
- Match cities to connections using `CityRoute.id` and connection's `originCityId`/`destinationCityId`
- Use connection's `distance`/`time` fields for graph edge labels

## Cleanup

- Delete `src/mocks/routesMock.ts`

## Out of Scope

- No backend changes
- No changes to connection or city services/pages
- No changes to graph/map visual styling
