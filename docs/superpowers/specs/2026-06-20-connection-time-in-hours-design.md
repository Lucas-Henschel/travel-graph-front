# Conexões: tempo em horas (em vez de minutos)

**Data:** 2026-06-20
**Status:** Aprovado, aguardando plano de implementação

## Contexto

Hoje o campo `time` da entidade `Connection` armazena minutos. O front-end já apresenta indícios de que a unidade pretendida era horas — em [`RoutesPage.vue:124`](../../../src/pages/RoutesPage.vue) o valor é exibido como `${con.time}h`, o que mostra que a UI assumia horas enquanto o cadastro pedia minutos. Essa inconsistência produz totais de rota incorretos e confunde o usuário.

## Objetivo

Padronizar todo o sistema (back-end + front-end) para que o tempo de uma conexão seja expresso em **horas decimais**, permitindo entrada pelo usuário em dois campos (horas + minutos) e exibição formatada de forma inteligente.

## Escopo

### Back-end (repositório separado)
- O campo `time` da entidade `Connection` passa a representar **horas decimais** (ex.: `1.5` = 1h30min).
- Tipo no banco e na API permanece numérico (decimal/float).
- Nome do campo permanece `time` — apenas a semântica muda.
- Migração: `UPDATE connections SET time = time / 60.0` para converter os registros existentes.
- Validação: `time > 0`.

### Front-end — formulário de criação
Arquivo: [`src/components/connections/CreateConnectionDialog.vue`](../../../src/components/connections/CreateConnectionDialog.vue)

- Substituir o `InputNumber` único do campo `time` por **dois campos lado a lado**:
  - `hours` — `InputNumber`, inteiro `≥ 0`, sem fração, sufixo `h`.
  - `minutes` — `InputNumber`, inteiro `0–59`, sem fração, sufixo `min`.
- Schema Zod:
  - `hours: z.number().int().min(0)`
  - `minutes: z.number().int().min(0).max(59)`
  - Refine cruzado: `hours + minutes > 0` (mensagem: "Informe o tempo da conexão.").
- Antes de enviar ao back-end:
  - Calcular `time = hours + minutes / 60`.
  - Remover `hours` e `minutes` do payload; enviar apenas `{ originCityId, destinationCityId, distance, time }`.

### Front-end — exibição
Criar helper compartilhado `formatHours(hoursDecimal: number): string` em **`src/utils/time.ts`** (novo arquivo) com as regras:

- Converter para minutos totais: `totalMin = Math.round(hoursDecimal * 60)`.
- Se `totalMin === 0` → `"0min"`.
- Se `totalMin < 60` → `"${totalMin}min"` (ex.: `45min`).
- Caso contrário:
  - `h = Math.floor(totalMin / 60)`
  - `m = totalMin % 60`
  - Se `m === 0` → `"${h}h"` (ex.: `2h`).
  - Senão → `"${h}h ${m}min"` (ex.: `1h 30min`).

Aplicar o helper em:
- [`src/pages/ConnectionsPage.vue`](../../../src/pages/ConnectionsPage.vue) — coluna "Tempo" (substituir `{{ data.time }} min`).
- [`src/pages/RoutesPage.vue`](../../../src/pages/RoutesPage.vue) — labels das arestas (linhas atuais ~124 e ~196) e total da rota (~646, substituindo o `toLocaleString` atual).

### Tipos
Arquivo: [`src/types/connection.ts`](../../../src/types/connection.ts)

- `ConnectionResponse.time: number` — adicionar comentário JSDoc: `/** Tempo em horas decimais. */`.
- `CreateConnectionRequest.time: number` — mesmo comentário JSDoc.
- Não introduzir tipos novos para `hours`/`minutes`; são campos locais do formulário.

## Fora de escopo

- Mudar nome do campo na API (`time` permanece).
- Alterar o critério `"time"` em [`src/types/route.ts`](../../../src/types/route.ts) — continua válido, só a unidade subjacente muda.
- Refatoração de outras telas além das listadas.
- Permitir frações de minuto (ex.: `30s`); a granularidade mínima é 1 minuto.

## Critérios de sucesso

1. Cadastrar uma conexão com `1h 30min` resulta em `time = 1.5` na resposta da API.
2. A listagem de conexões exibe `1h 30min` para a conexão acima e `45min` para uma de 0.75h.
3. O total de uma rota agregando `1h 30min + 45min` aparece como `2h 15min`.
4. Após a migração, conexões pré-existentes mantêm a mesma duração real (apenas a unidade muda).
5. O formulário rejeita submissão com `hours = 0` e `minutes = 0`.
6. `minutes` é limitado a 0–59 no input.

## Dependências

- A migração do back-end deve ser aplicada **antes** do deploy do front-end com este design, caso contrário valores antigos (em minutos) serão interpretados como horas e renderizados incorretamente.
