# CRUD de Cidades e Pontos Turísticos

## Objetivo

Criar páginas de CRUD para Cidades e Pontos Turísticos no frontend, seguindo o padrão existente da UsersPage (DataTable + Dialogs + ServiceResult + Zod validation + Toast notifications). Os novos menus ficam sob "Turismo" no sidebar.

## API Endpoints

### Cidades (`/cities`)

| Método | Rota          | Body                                      | Resposta         |
|--------|---------------|--------------------------------------------|------------------|
| GET    | `/cities`     | —                                          | CityResponse[]   |
| GET    | `/cities/{id}`| —                                          | CityResponse     |
| POST   | `/cities`     | `{ name, latitude?, longitude? }`          | CityResponse     |
| PUT    | `/cities/{id}`| `{ name, latitude?, longitude? }`          | CityResponse     |
| DELETE | `/cities/{id}`| —                                          | 204 No Content   |

**CityResponse**: `{ id, name, latitude, longitude, createdAt, updatedAt }`

### Pontos Turísticos (`/attractions`)

| Método | Rota               | Body                                                        | Resposta              |
|--------|---------------------|--------------------------------------------------------------|-----------------------|
| GET    | `/attractions`      | —                                                            | AttractionResponse[]  |
| GET    | `/attractions/{id}` | —                                                            | AttractionResponse    |
| POST   | `/attractions`      | `{ name, description?, category?, latitude?, longitude?, cityId }` | AttractionResponse    |
| PUT    | `/attractions/{id}` | `{ name, description?, category?, latitude?, longitude? }`   | AttractionResponse    |
| DELETE | `/attractions/{id}` | —                                                            | 204 No Content        |

**AttractionResponse**: `{ id, name, description, category, latitude, longitude, createdAt, updatedAt, city: CityResponse }`

## Validação (API)

### Cidades
- `name`: @NotBlank, @Size(max=100)
- `latitude`: Double, nullable
- `longitude`: Double, nullable

### Pontos Turísticos
- `name`: @NotBlank, @Size(max=100)
- `description`: @Size(max=255), nullable
- `category`: @Size(max=50), nullable
- `latitude`: Double, nullable
- `longitude`: Double, nullable
- `cityId`: @NotNull (somente no create)

## Arquitetura

### Tipos TypeScript

**`src/types/city.ts`**:
```typescript
interface CityResponse {
  id: number
  name: string
  latitude: number | null
  longitude: number | null
  createdAt: string
  updatedAt: string
}

interface CreateCityRequest {
  name: string
  latitude: number | null
  longitude: number | null
}

interface UpdateCityRequest {
  name: string
  latitude: number | null
  longitude: number | null
}
```

**`src/types/attraction.ts`**:
```typescript
interface AttractionResponse {
  id: number
  name: string
  description: string | null
  category: string | null
  latitude: number | null
  longitude: number | null
  createdAt: string
  updatedAt: string
  city: CityResponse
}

interface CreateAttractionRequest {
  name: string
  description: string | null
  category: string | null
  latitude: number | null
  longitude: number | null
  cityId: number
}

interface UpdateAttractionRequest {
  name: string
  description: string | null
  category: string | null
  latitude: number | null
  longitude: number | null
}
```

### Serviços

**`src/services/cityService.ts`** — ServiceResult pattern:
- `findAll()`: GET `/cities` → CityResponse[]
- `findById(id)`: GET `/cities/{id}` → CityResponse
- `create(data)`: POST `/cities` → CityResponse
- `update(id, data)`: PUT `/cities/{id}` → CityResponse
- `remove(id)`: DELETE `/cities/{id}` → void

**`src/services/attractionService.ts`** — mesmo padrão:
- `findAll()`: GET `/attractions` → AttractionResponse[]
- `findById(id)`: GET `/attractions/{id}` → AttractionResponse
- `create(data)`: POST `/attractions` → AttractionResponse
- `update(id, data)`: PUT `/attractions/{id}` → AttractionResponse
- `remove(id)`: DELETE `/attractions/{id}` → void

### Páginas

#### CitiesPage (`src/pages/CitiesPage.vue`)

DataTable com colunas:
- Nome
- Latitude
- Longitude
- Criado em (formatado)

Funcionalidades:
- Busca global por nome
- Paginação (10 por página)
- Botão "Nova Cidade" no header
- Botões editar/excluir por linha

Dialogs:
- **CreateCityDialog**: Nome (obrigatório, max 100), Latitude (opcional), Longitude (opcional)
- **EditCityDialog**: mesmos campos, pré-preenchidos com watch
- **DeleteCityDialog**: confirmação com nome da cidade

#### AttractionsPage (`src/pages/AttractionsPage.vue`)

DataTable com colunas:
- Nome
- Categoria
- Cidade (nome da cidade associada)
- Descrição (truncada)
- Criado em (formatado)

Funcionalidades:
- Busca global por nome e categoria
- Paginação (10 por página)
- Botão "Novo Ponto Turístico" no header
- Botões editar/excluir por linha

Dialogs:
- **CreateAttractionDialog**: Nome (obrigatório), Descrição (opcional, max 255), Categoria (dropdown fixo), Cidade (dropdown das cidades cadastradas), Latitude (opcional), Longitude (opcional)
- **EditAttractionDialog**: mesmos campos, pré-preenchidos. Cidade editável via dropdown.
- **DeleteAttractionDialog**: confirmação com nome do ponto

### Categorias Pré-definidas

```typescript
const ATTRACTION_CATEGORIES = [
  'Museu',
  'Parque',
  'Praia',
  'Monumento',
  'Restaurante',
  'Igreja',
  'Mirante',
  'Centro Histórico',
  'Teatro',
  'Outro',
]
```

### Navegação (DashboardLayout)

Menu "Turismo" atualizado:
- Cidades (`/dashboard/cities`, ícone: `pi-building`)
- Pontos Turísticos (`/dashboard/attractions`, ícone: `pi-map-marker`)
- Rotas (`/dashboard/routes`, já existente)

### Router

Novas rotas filhas de `/dashboard`:
- `cities` → CitiesPage
- `attractions` → AttractionsPage

## Validação Frontend (Zod)

### City Schema
```typescript
z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
})
```

### Attraction Schema (Create)
```typescript
z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().max(255, 'Descrição deve ter no máximo 255 caracteres').nullable(),
  category: z.string().max(50).nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  cityId: z.number({ required_error: 'Cidade é obrigatória' }),
})
```

## Padrões a Seguir

- Composition API com `<script setup lang="ts">`
- Validação com Zod + zodResolver (PrimeVue Forms)
- ServiceResult pattern `{ data, error }` em todos os serviços
- Toast notifications via useNotification composable
- Eventos `@created`, `@updated`, `@deleted` dos dialogs para refetch na página pai
- Dark theme com classes Tailwind existentes
- Responsividade mobile/desktop
