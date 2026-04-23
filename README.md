# Instalaciones Samsara

> Descripcion general del proyecto: **pendiente**.

## Requisitos

- Node.js 20+
- pnpm 9+

## Correr el proyecto en local

1. Clona el repositorio.
2. Instala dependencias:

```bash
pnpm install
```

3. Crea tu archivo `.env.local` con estas variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

4. Inicia el servidor de desarrollo:

```bash
pnpm dev
```

5. Abre [http://localhost:3000](http://localhost:3000).

## Base de datos (Supabase)

El esquema inicial vive en `supabase/migrations`.

Si trabajas con Supabase CLI, el flujo usual es:

```bash
supabase start
supabase db reset
```

> Ajusta estos comandos a tu flujo (local o proyecto remoto enlazado).

## Scripts utiles

- `pnpm dev`: levanta el proyecto en modo desarrollo
- `pnpm build`: compila para produccion
- `pnpm start`: corre el build
- `pnpm lint`: ejecuta eslint
- `pnpm format`: aplica prettier
- `pnpm format:check`: valida formato sin escribir cambios
- `pnpm update-types`: regenera `src/types/database.types.ts` desde Supabase

## Roadmap tecnico (pendiente)

- E2E testing (Playwright o Cypress)
- Hooks de calidad con Husky + lint-staged
- CI/CD en GitHub Actions (checks previos al deploy)
- Deploy en Vercel
