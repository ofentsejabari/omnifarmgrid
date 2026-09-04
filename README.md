# Omnifarmgrid

Nx monorepo for **Agroherd Farm Manager**. The admin UI lives in `apps/adminportal`. Helm (Spartan) components live in `libs/ui`. Shared Tailwind theme tokens live in `libs/css/theme.css`. Appwrite schema is versioned in `appwrite.config.json`.

This guide is how to **scaffold the same stack** from scratch: Tailwind CSS v4, Spartan UI, NgRx SignalStore, Appwrite TablesDB, the Appwrite CLI, and the Angular proxy that keeps the SDK same-origin in development.

## Stack

| Layer | Choice |
| --- | --- |
| Workspace | [Nx](https://nx.dev) + [pnpm](https://pnpm.io) |
| App | Angular 22 standalone |
| Styling | Tailwind CSS v4 + PostCSS |
| UI | [spartan/ui](https://spartan.ng) (`@spartan-ng/brain` + Helm libraries) |
| Icons | `@ng-icons/lucide` |
| State | `@ngrx/signals` SignalStore |
| Backend | Appwrite TablesDB + Realtime |
| Schema | `appwrite.config.json` pushed with the Appwrite CLI |

## Prerequisites

- Node.js 22+
- pnpm (`corepack enable` then `corepack prepare pnpm@11.25.0 --activate`)
- A running Appwrite instance (self-hosted Docker on `http://localhost` in this repo)
- [Appwrite CLI](https://appwrite.io/docs/tooling/command-line/installation)

```sh
npm install -g appwrite-cli
appwrite -v
```

---

## 1. Create the Nx Angular workspace

```sh
npx create-nx-workspace@latest omnifarmgrid \
  --preset=angular-monorepo \
  --appName=adminportal \
  --style=css \
  --bundler=esbuild \
  --ssr=false \
  --unitTestRunner=none \
  --e2eTestRunner=none \
  --nxCloud=skip \
  --packageManager=pnpm
```

Or add an app to an existing workspace:

```sh
pnpm nx g @nx/angular:app adminportal --directory=apps/adminportal --style=css --bundler=esbuild
```

Install dependencies from the repo root:

```sh
pnpm install
```

Serve the admin app:

```sh
pnpm nx serve adminportal
```

---

## 2. Tailwind CSS v4

Spartan requires Tailwind v4. Do **not** add a `tailwind.config.js`. Tailwind 4 is configured with CSS and PostCSS.

### 2.1 Packages

```sh
pnpm add tailwindcss @tailwindcss/postcss postcss
```

### 2.2 PostCSS per app

Create `apps/adminportal/.postcssrc.json` (and the same file next to any other Angular app):

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Angular's application builder picks this up automatically. Confirm the app `project.json` `build.options.styles` points at the global stylesheet, for example `apps/adminportal/src/styles.css`.

### 2.3 Shared theme

This workspace keeps one theme for every app in `libs/css/theme.css`:

```css
@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css';

@import "@spartan-ng/brain/hlm-tailwind-preset.css";
```

Then each app stylesheet only imports the shared file:

```css
@import "../../../libs/css/theme.css";
```

The `@layer` split is required so ng-icons and Angular CDK overlay styles load in the right order. The Spartan preset already includes `tw-animate-css` and `@angular/cdk/overlay-prebuilt.css`.

Theme tokens (`--background`, `--primary`, `--radius`, sidebar and chart colors, plus a `:root.dark` block) also live in `libs/css/theme.css`. Generate them with Spartan's theme generator (next section) or copy the variables from [spartan theming](https://spartan.ng/documentation/theming).

---

## 3. Spartan UI

Spartan is two layers:

1. **Brain** — headless primitives from npm (`@spartan-ng/brain`)
2. **Helm** — styled components copied into this repo as Nx libraries under `libs/ui`, imported as `@spartan-ng/helm/<component>`

### 3.1 Init

```sh
pnpm add -D @spartan-ng/cli
pnpm add @spartan-ng/brain @angular/cdk class-variance-authority clsx tailwind-merge
pnpm add @ng-icons/core @ng-icons/lucide

pnpm nx g @spartan-ng/cli:init
```

Init wires the Tailwind preset, theme, and dependencies. Then generate Helm libraries (this repo uses `generateAs: "library"`):

```sh
pnpm nx g @spartan-ng/cli:ui
```

Pass `--name=button` (or another component) to skip the interactive picker. Repeat for each primitive you need (`alert`, `badge`, `card`, `checkbox`, `field`, `input`, `native-select`, `textarea`, …).

Optional theme generator:

```sh
pnpm nx g @spartan-ng/cli:ui-theme
```

### 3.2 `components.json`

Created at the workspace root when Helm is first generated:

```json
{
  "componentsPath": "libs/ui",
  "buildable": true,
  "generateAs": "library",
  "importAlias": "@spartan-ng/helm",
  "style": "nova"
}
```

Nx path mappings in `tsconfig.base.json` point `@spartan-ng/helm/button` (and every other primitive) at `libs/ui/<name>/src/index.ts`.

### 3.3 Icons and Helm providers

Register Lucide icons once in `app.config.ts`:

```ts
import { provideLucideIcons } from './core/utils/lucide-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideLucideIcons(),
  ],
};
```

`provideLucideIcons()` wraps `provideIcons(...)` from `@ng-icons/core`. Add new glyphs in `apps/adminportal/src/app/core/utils/lucide-icons.ts`.

If you use overlay-based Helm pieces (dialog, sheet, tooltip, toaster), also add `provideSpartanHlm()` from `@spartan-ng/helm/utils`.

### 3.4 Using Helm in a standalone component

Group the primitives you reuse in `SpartanUiImports` and spread them into `imports`:

```ts
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-animal-list',
  imports: [FormsModule, RouterLink, ...SpartanUiImports],
  templateUrl: './animal-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalListComponent {}
```

Templates use Helm selectors and Tailwind utilities, for example `hlmBtn`, `hlmCard`, `hlmInput`.

---

## 4. NgRx SignalStore

Install:

```sh
pnpm add @ngrx/signals
```

This app does **not** use NgRx Store / Effects. Each domain has a root SignalStore that:

1. Holds state with `withState`
2. Talks to an injectable service with `withMethods`
3. Loads data and subscribes to Appwrite realtime in `withHooks({ onInit })`

### 4.1 Pattern

```ts
import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

interface KraalState {
  kraals: Kraal[];
}

export const KraalStore = signalStore(
  { providedIn: 'root' },
  withState<KraalState>({ kraals: [] }),
  withMethods((store) => {
    const kraalService = inject(KraalDataService);

    const refresh = async (): Promise<void> => {
      const rows = await kraalService.list();
      patchState(store, { kraals: rows });
    };

    return {
      async create(name: string): Promise<Kraal> { /* ... */ },
      _refresh: refresh,
      _setupWatch: () => kraalService.watch(() => void refresh()),
    };
  }),
  withHooks({
    onInit(store) {
      void store._refresh();
      store._setupWatch();
    },
  }),
);

export type KraalStore = InstanceType<typeof KraalStore>;
```

Components inject the store (`inject(KraalStore)`) and read signals in the template (`kraalStore.kraals()`). They never talk to Appwrite directly.

### 4.2 Layering (store → service → mapper → TablesDB)

```
Component
  → SignalStore          domain actions + cached signals
    → *Service           Query / CRUD against one table
      → mapper           Appwrite row ↔ typed model
        → AppwriteRowStore   TablesDB + Realtime
```

| File | Role |
| --- | --- |
| `core/models/*.ts` | Domain types |
| `core/services/<entity>.mapper.ts` | Table id + `fromAppwrite*` / `toAppwrite*` |
| `core/services/<entity>.service.ts` | `list` / `get` / `create` / `update` / `watch` |
| `core/stores/<entity>.store.ts` | SignalStore |
| `core/data/appwrite-row-store.ts` | Shared TablesDB pagination, mutations, realtime |

Mappers must strip the domain `id` before writes (`withoutId`) because Appwrite uses `$id` as the row id, not a data column.

---

## 5. Appwrite client in Angular

### 5.1 SDK

```sh
pnpm add appwrite
```

Use **TablesDB**, not the deprecated `Databases` / collections API.

### 5.2 Constants

`apps/adminportal/src/app/core/appwrite/appwrite.constants.ts`:

```ts
const browserOrigin = typeof globalThis.location === 'undefined' ? '' : globalThis.location.origin;
const browserPort = typeof globalThis.location === 'undefined' ? '' : globalThis.location.port;

export const APPWRITE_ENDPOINT =
  browserPort === '4200' ? `${browserOrigin}/v1` : 'http://localhost/v1';
export const APPWRITE_PROJECT_ID = '6a956c6d0038a1f7b9cb';
export const APPWRITE_DATABASE_ID = '6a956d9a0006188dc2cc';
```

On the Nx dev server (`:4200`) the SDK calls **same-origin** `/v1/...`. The Angular proxy forwards that to Appwrite (see [Dev-server proxy](#7-dev-server-proxy)). Outside port 4200 it talks to the self-hosted instance on `http://localhost/v1`.

Copy `APPWRITE_PROJECT_ID` and `APPWRITE_DATABASE_ID` from `appwrite.config.json` (`projectId` and `tablesDB[0].$id`). If you recreate the Appwrite project, update both files.

### 5.3 Client service

```ts
@Injectable({ providedIn: 'root' })
export class AppwriteClient {
  readonly client: Client;
  readonly account: Account;
  readonly tables: TablesDB;
  readonly realtime: Realtime;

  constructor() {
    this.client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
    this.account = new Account(this.client);
    this.tables = new TablesDB(this.client);
    this.realtime = new Realtime(this.client);
  }
}
```

This app creates an **anonymous session** if `account.get()` fails, so table permissions of `users` work without a login screen. Enable anonymous auth on the Appwrite project (already on in `appwrite.config.json` → `settings.auth.methods.anonymous`).

### 5.4 Console checklist

In the Appwrite Console (or via CLI settings):

1. Create a project and a TablesDB database (this repo uses database name `fma`).
2. Add a **Web** platform for `http://localhost:4200` (needed if you ever skip the proxy).
3. Turn on Account + Databases + Realtime.
4. Turn on anonymous sessions if you use the guest-session helper.

---

## 6. Appwrite CLI and `appwrite.config.json`

`appwrite.config.json` at the workspace root is the **source of truth** for project settings and table schema. Commit it. Do not create tables only in the Console and forget to pull — the next `push` will not know about them.

### 6.1 Login and link the project

Self-hosted (this repo):

```sh
appwrite login --endpoint http://localhost/v1
appwrite client --self-signed true   # only if the instance uses a self-signed cert
appwrite init project
```

Cloud:

```sh
appwrite login
appwrite init project
```

`init project` writes `projectId` (and usually `organizationId`) into `appwrite.config.json`. You can also point the CLI at an existing file:

```sh
appwrite client --endpoint http://localhost/v1
appwrite client --project-id 6a956c6d0038a1f7b9cb
```

### 6.2 Pull / push tables

```sh
# Download remote schema into appwrite.config.json
appwrite pull tables

# Apply local schema to the remote project
appwrite push tables
```

Use `appwrite pull tables --all` when you want every database. Use `--force` only in CI; interactively, review the change table the CLI prints (it will warn before recreating a column).

Non-destructive column updates (`required`, `size`, enum `elements`, …) apply in place. Changing `type` or `array` still recreates the column.

Rename a column by setting `key` to the new name and adding `"previousKey": "oldName"`.

### 6.3 Create a database and a table in the config

`tablesDB` is the list of databases. `tables` is the list of tables. Each table's `databaseId` must match a `tablesDB.$id`.

```json
{
  "projectId": "6a956c6d0038a1f7b9cb",
  "tablesDB": [
    {
      "$id": "6a956d9a0006188dc2cc",
      "name": "fma",
      "enabled": true
    }
  ],
  "tables": [
    {
      "$id": "kraals",
      "name": "kraals",
      "databaseId": "6a956d9a0006188dc2cc",
      "enabled": true,
      "rowSecurity": false,
      "$permissions": [
        "create(\"users\")",
        "read(\"users\")",
        "update(\"users\")",
        "delete(\"users\")"
      ],
      "columns": [
        {
          "key": "name",
          "type": "varchar",
          "required": true,
          "array": false,
          "size": 255,
          "default": null,
          "encrypt": false
        },
        {
          "key": "species",
          "type": "string",
          "required": true,
          "array": false,
          "default": null,
          "format": "enum",
          "elements": ["goat", "sheep", "pig"]
        },
        {
          "key": "createdAt",
          "type": "datetime",
          "required": true,
          "array": false,
          "default": null,
          "format": ""
        }
      ],
      "indexes": [
        {
          "key": "name",
          "type": "key",
          "status": "available",
          "columns": ["name"],
          "orders": ["ASC"]
        }
      ]
    }
  ]
}
```

Then:

```sh
appwrite push tables
```

Alternatively, scaffold a table interactively with `appwrite init tables`, then edit columns in the JSON and push.

Do **not** mix `appwrite tables-db create-table` / `create-varchar-column` with config-based deploys unless you immediately `pull tables`. The CLI's next `push` compares against the file, not against ad-hoc API calls.

### 6.4 Column types used in this project

| JSON `type` / `format` | When to use |
| --- | --- |
| `varchar` + `size` | Short strings, ids (`size: 36` for UUIDs) |
| `text` | Long notes |
| `string` + `"format": "enum"` + `elements` | Closed lists (`species`, `status`, `sex`) |
| `boolean` | Flags |
| `integer` | Counts / doses |
| `datetime` | ISO timestamps |
| `"array": true` on `varchar` | Id lists (`kidIds`, `treatedAnimalIds`) |

Permissions `"users"` match the anonymous (or logged-in) session. `"any"` is public and is not used here.

### 6.5 Tables in this project

Database `fma` (`6a956d9a0006188dc2cc`):

| Table `$id` | Purpose |
| --- | --- |
| `kraals` | Pens / locations per species |
| `animals` | Herd records |
| `products` | Vaccines, dewormers, dips |
| `batches` | Stock lots |
| `stockMovements` | In / out / waste / expired |
| `events` | Birth, death, treatment, move |

After adding a table:

1. Add a mapper (`ANIMAL_TABLE = 'animals'`, …).
2. Add a service that calls `AppwriteRowStore`.
3. Add a SignalStore that refreshes and `watch()`es the table.
4. Keep `APPWRITE_DATABASE_ID` in sync with `tablesDB[0].$id`.

Realtime channel used by `AppwriteRowStore`:

```text
databases.{DATABASE_ID}.tables.{table}.rows
```

---

## 7. Dev-server proxy

Browsers block the Appwrite SDK if the page is `http://localhost:4200` and the API is `http://localhost/v1` (different origin). The admin app avoids that in development by calling `/v1` on the Angular origin and proxying it.

### 7.1 `proxy.conf.json` (workspace root)

```json
{
  "/v1": {
    "target": "http://localhost",
    "secure": false,
    "changeOrigin": true,
    "ws": true
  }
}
```

- `target` is the Appwrite host **without** `/v1` — the request path is already `/v1/...`.
- `ws: true` is required for TablesDB Realtime (WebSocket).
- `secure: false` is required for local HTTP / self-signed TLS.

### 7.2 Wire it into Nx

In `apps/adminportal/project.json`, under `targets.serve.options`:

```json
"serve": {
  "continuous": true,
  "executor": "@angular/build:dev-server",
  "defaultConfiguration": "development",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

### 7.3 How the SDK uses it

When `location.port === '4200'`, `APPWRITE_ENDPOINT` is `${location.origin}/v1` (for example `http://localhost:4200/v1`). The browser sends:

```text
http://localhost:4200/v1/tablesdb/...
http://localhost:4200/v1/realtime?...   (WebSocket)
```

The dev server forwards those to:

```text
http://localhost/v1/tablesdb/...
http://localhost/v1/realtime?...
```

If Realtime never fires, confirm `ws: true` and that Appwrite's websocket protocol is enabled (`settings.protocols.websocket` in `appwrite.config.json`).

If you change the Appwrite host or port, update **both** `proxy.conf.json` `target` and the non-4200 branch of `APPWRITE_ENDPOINT`.

---

## Daily commands

```sh
pnpm install
pnpm nx serve adminportal          # http://localhost:4200, Appwrite via /v1 proxy
pnpm nx build adminportal
pnpm nx serve website

appwrite login --endpoint http://localhost/v1
appwrite pull tables               # remote → appwrite.config.json
appwrite push tables               # appwrite.config.json → remote
```

Add another Helm component:

```sh
pnpm nx g @spartan-ng/cli:ui --name=dialog
```

Add another Angular app:

```sh
pnpm nx g @nx/angular:app demo --directory=apps/demo --style=css
```

Copy `.postcssrc.json`, import `libs/css/theme.css` from that app's `styles.css`, and add `proxyConfig` if it also talks to Appwrite.

---

## Layout

```text
appwrite.config.json          Appwrite project + TablesDB schema
proxy.conf.json               /v1 → local Appwrite (HTTP + WebSocket)
components.json               Spartan Helm generator settings
apps/adminportal/             Farm Manager UI
  .postcssrc.json
  project.json                serve.proxyConfig → proxy.conf.json
  src/styles.css              @import shared theme
  src/app/core/
    appwrite/                 Client, endpoint, project/database ids
    data/                     AppwriteRowStore + mappers helpers
    models/ services/ stores/
apps/website/                 Marketing site (same Tailwind theme)
libs/css/theme.css            Tailwind v4 + Spartan tokens
libs/ui/<component>/          Helm libraries (@spartan-ng/helm/*)
```
