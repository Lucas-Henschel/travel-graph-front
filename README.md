# TravelGraph Front

Base inicial do front-end do TravelGraph com Vue 3, TypeScript, Tailwind CSS, PrimeVue, Pinia, ESLint e EditorConfig.

## Estrutura

- `src/components/`: componentes reutilizáveis
- `src/layouts/`: shells de página
- `src/pages/`: telas roteadas
- `src/router/`: rotas e guards
- `src/services/`: utilitários e integrações locais, quando necessário
- `src/stores/`: estado global com Pinia
- `src/styles/`: estilos globais e Tailwind
- `src/types/`: contratos TypeScript compartilhados
- `src/utils/`: helpers puros

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Observações

- O login fica na rota `/` e a dashboard protegida fica em `/dashboard`.
- Os formulários usam `PrimeVue Forms` com `zod` para validação.
- A autenticação é local, usando sessão em `localStorage`, sem chamadas para API.
- A estrutura foi desenhada para crescer por camadas sem reorganização precoce.
- Commits são feitos manualmente por solicitação explícita do usuário.
