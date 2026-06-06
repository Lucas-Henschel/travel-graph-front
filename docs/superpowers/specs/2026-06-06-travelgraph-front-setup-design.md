# TravelGraph Front Setup Design

## Context
The project will start as a Vue 3 single-page application for a dashboard authenticated with JWT. The initial goal is not feature delivery, but a clean and scalable front-end foundation that can support future modules without structural rewrites.

## Goals
- Establish a predictable project structure from day one.
- Use Vue 3 with TypeScript as the default application stack.
- Add Tailwind CSS for utility-first styling.
- Add Pinia for global state management.
- Add ESLint for code quality and EditorConfig for indentation consistency.
- Keep the architecture simple enough for the first version, but organized for growth.

## Proposed Structure
The project will follow a layered `src/` organization:

```txt
src/
  assets/
  components/
  composables/
  layouts/
  pages/
  router/
  services/
  stores/
  styles/
  types/
  utils/
```

### Folder Responsibilities
- `assets/`: images, icons, and static resources.
- `components/`: reusable UI pieces with no page-specific responsibility.
- `composables/`: reusable Vue logic extracted from components.
- `layouts/`: shared page shells such as auth and dashboard layouts.
- `pages/`: routed views and page-level compositions.
- `router/`: route definitions, guards, and navigation setup.
- `services/`: API client, auth requests, and backend integration logic.
- `stores/`: Pinia stores, starting with authentication and UI state.
- `styles/`: Tailwind entry points and minimal global styles.
- `types/`: shared TypeScript contracts for API and domain data.
- `utils/`: pure helper functions with no framework dependencies.

## Architecture Rules
- Authentication state lives in `stores/auth` and talks to the API through `services/auth`.
- JWT handling is centralized, including token persistence and request interception.
- Reusable UI stays in `components/`; page-specific logic stays in `pages/`.
- Shared layout concerns stay in `layouts/` instead of being duplicated across pages.
- Styling uses Tailwind first; custom CSS stays minimal and global only when necessary.
- TypeScript is required across the app to keep API contracts explicit and reduce drift.

## Tooling Baseline
- `Vue 3` for the application framework.
- `TypeScript` for typed components, stores, services, and router definitions.
- `Pinia` for state management.
- `Tailwind CSS` for styling.
- `ESLint` for code quality and consistency.
- `EditorConfig` for indentation and whitespace rules.

## Scope
This setup covers the front-end foundation only:
- project structure
- toolchain configuration
- folder boundaries
- architectural conventions

It does not define business features, screen designs, or backend endpoints.

## Success Criteria
- The root structure is easy to navigate and consistent.
- Auth-related code has a clear home.
- Components, pages, and services do not overlap responsibilities.
- The project is ready for the first dashboard screens without reorganizing folders.

## Open Constraint
The workspace currently does not contain a Git repository, so this spec can be saved now but cannot be committed until a repo is initialized.
