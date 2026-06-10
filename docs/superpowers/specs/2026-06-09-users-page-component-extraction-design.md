# UsersPage Component Extraction

## Objetivo

Extrair os modais de criar, editar e excluir usuários do `UsersPage.vue` em componentes separados dentro de `src/components/users/`.

## Componentes

### `CreateUserDialog.vue`

- **Props:** `visible` (boolean)
- **Emits:** `update:visible`, `created`
- Formulário com nome, email, senha
- Chama `userService.create()` internamente
- Gerencia seu próprio `loading`
- Usa `useNotification()` para toasts
- Emite `created` ao salvar com sucesso

### `EditUserDialog.vue`

- **Props:** `visible` (boolean), `user` (UserResponse | null)
- **Emits:** `update:visible`, `updated`
- Preenche formulário com dados do `user` recebido
- Chama `userService.update()` internamente
- Gerencia seu próprio `loading`
- Usa `useNotification()` para toasts
- Emite `updated` ao salvar com sucesso

### `DeleteUserDialog.vue`

- **Props:** `visible` (boolean), `user` (UserResponse | null)
- **Emits:** `update:visible`, `deleted`
- Exibe confirmação com nome do usuário
- Chama `userService.remove()` internamente
- Gerencia seu próprio `loading`
- Usa `useNotification()` para toasts
- Emite `deleted` ao excluir com sucesso

## UsersPage.vue resultante

- Mantém: lista de usuários, busca, DataTable, header
- Gerencia qual dialog abrir e qual usuário está selecionado
- Recarrega a lista ao receber eventos `created`/`updated`/`deleted`
- Passa `UserResponse` como prop para Edit e Delete

## Estilo

- Todos os dialogs mantêm o dark theme existente (`!bg-slate-900`, `!border-white/10`)
- Pattern `v-model:visible` para abrir/fechar
