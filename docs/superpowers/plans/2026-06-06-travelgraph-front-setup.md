# TravelGraph Front Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap a Vue 3 dashboard SPA with TypeScript, Tailwind CSS, Pinia, ESLint, and EditorConfig using a layered project structure that can grow without reorganizing later.

**Architecture:** Start from a clean Vite-based Vue app, then layer in shared configuration, routing, state, and styling in small bounded files. Keep auth and API concerns isolated in `services/` and `stores/`, keep page shells in `layouts/`, and keep shared helpers in `composables/`, `types/`, and `utils/`.

**Tech Stack:** Vue 3, TypeScript, Vite, Pinia, Vue Router, Tailwind CSS, ESLint, EditorConfig.

---

### Task 1: Create the application scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/assets/`
- Create: `src/components/`
- Create: `src/composables/`
- Create: `src/layouts/`
- Create: `src/pages/`
- Create: `src/router/`
- Create: `src/services/`
- Create: `src/stores/`
- Create: `src/styles/`
- Create: `src/types/`
- Create: `src/utils/`

- [ ] **Step 1: Initialize the Vite Vue TypeScript app structure**

Create a Vite-based package with the following core scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx,.vue --max-warnings 0"
  }
}
```

- [ ] **Step 2: Create the root Vue entrypoint**

Use `src/main.ts` to mount the app, import global styles, and register Pinia and Router once they exist:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'

createApp(App).mount('#app')
```

- [ ] **Step 3: Create the baseline shell component**

Use `src/App.vue` as a simple application shell that renders the active route:

```vue
<template>
  <router-view />
</template>
```

- [ ] **Step 4: Verify the scaffold can build**

Run:

```bash
npm run build
```

Expected: the build fails only for missing dependencies/configuration that will be added in later tasks, not for invalid file paths or syntax errors in the scaffold.

### Task 2: Add project formatting and linting rules

**Files:**
- Create: `.editorconfig`
- Create: `.eslintignore`
- Create: `eslint.config.js`
- Create: `src/**/*.ts`, `src/**/*.vue` lint coverage through the config

- [ ] **Step 1: Define indentation and whitespace rules**

Create `.editorconfig` with consistent indentation and line endings:

```ini
root = true

[*.{js,ts,vue,css,html,json,md}]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 2: Configure ESLint for Vue 3 + TypeScript**

Use `eslint.config.js` to lint Vue SFCs and TypeScript files with zero-warnings enforcement. The config should include Vue parser support, TypeScript parser support, and a rule set that keeps the codebase consistent without overreaching into opinionated style choices.

- [ ] **Step 3: Verify linting behavior on an intentionally broken file**

Create a temporary file with a clear lint issue, run:

```bash
npm run lint
```

Expected: ESLint reports the issue with a file path and line number, proving the config is active.

### Task 3: Add Tailwind CSS and global styling

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.cjs`
- Create: `src/styles/main.css`
- Create: `src/assets/` style references as needed

- [ ] **Step 1: Install and wire Tailwind into the build**

Configure Tailwind to scan Vue and TypeScript files under `src/`, then import the Tailwind layers in `src/styles/main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

html,
body,
#app {
  min-height: 100%;
}

body {
  margin: 0;
}
```

- [ ] **Step 2: Keep global CSS minimal**

Restrict custom CSS to app-wide defaults only. Any page-specific visual treatment should be done in Vue components through Tailwind utilities.

- [ ] **Step 3: Verify Tailwind classes render in the browser**

Add a temporary utility-driven element in `src/App.vue` and run:

```bash
npm run dev
```

Expected: the app starts and Tailwind utilities apply in the rendered UI.

### Task 4: Add routing, Pinia, and auth foundation

**Files:**
- Create: `src/router/index.ts`
- Create: `src/router/guards.ts`
- Create: `src/stores/auth.ts`
- Create: `src/stores/ui.ts`
- Create: `src/services/http.ts`
- Create: `src/services/auth.ts`
- Create: `src/layouts/AuthLayout.vue`
- Create: `src/layouts/DashboardLayout.vue`
- Create: `src/pages/LoginPage.vue`
- Create: `src/pages/DashboardPage.vue`
- Create: `src/types/auth.ts`

- [ ] **Step 1: Wire Pinia and Vue Router into the app**

Register both plugins in `src/main.ts` and keep routing definitions in `src/router/index.ts`. Define at least:
- a public login route
- a protected dashboard route
- a fallback route for unknown paths

- [ ] **Step 2: Centralize JWT-aware HTTP behavior**

Implement `src/services/http.ts` as the single HTTP client entry point and keep JWT persistence/interception logic there so stores and pages never duplicate token handling.

- [ ] **Step 3: Define the auth store contract**

Implement `src/stores/auth.ts` with state for the token, current user, and authentication status. The store should expose explicit actions such as login, logout, and session hydration.

- [ ] **Step 4: Add protected-route behavior**

Use `src/router/guards.ts` to prevent unauthenticated access to dashboard routes and redirect users to the login page when no valid session exists.

- [ ] **Step 5: Verify the app boots with the auth shell**

Run:

```bash
npm run dev
```

Expected: the login page loads publicly, the dashboard route is guarded, and navigation does not crash on first render.

### Task 5: Validate the foundation and document the setup

**Files:**
- Modify: `README.md`
- Modify: `package.json` scripts if needed
- Create or update: `docs/` setup notes if useful

- [ ] **Step 1: Run build and lint together**

Run:

```bash
npm run lint && npm run build
```

Expected: both commands pass with no syntax errors, missing imports, or TypeScript configuration issues.

- [ ] **Step 2: Add a short setup note for future contributors**

Document the folder boundaries and the rule that auth, routing, and styling stay in their dedicated layers. Keep the note short and operational, not explanatory.

- [ ] **Step 3: Confirm the scaffold matches the approved spec**

Check that the project contains:
- layered `src/` folders
- Vue 3 + TypeScript entrypoint
- Tailwind global styles
- Pinia state layer
- ESLint and EditorConfig
- JWT-ready auth and route structure

Note: no commit steps are included because the user explicitly requested that commits remain manual.
