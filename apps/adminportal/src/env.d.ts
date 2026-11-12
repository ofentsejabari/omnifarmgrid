// Variables from .env, injected by @ngx-env/builder. Everything here is public.
declare interface Env {
  readonly NG_APP_APPWRITE_ENDPOINT: string;
  readonly NG_APP_APPWRITE_PROJECT_ID: string;
  readonly NG_APP_APPWRITE_DATABASE_ID: string;
}

declare interface ImportMeta {
  readonly env: Env;
}
