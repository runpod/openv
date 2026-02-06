# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenV is a Next.js 15 App Router application for generating videos using open-source AI models (currently Mochi 1). It submits jobs to RunPod for GPU processing and receives results via webhooks.

## Commands

```bash
yarn dev                  # Dev server with Turbo on port 3001
yarn dev:test             # Dev server in test mode (bypasses Clerk auth)
yarn build                # Lint + Next.js build
yarn lint:fix             # ESLint auto-fix
yarn prisma:migrate       # Run migrations (uses .env.local)
yarn prisma:studio        # Database GUI

yarn test:unit            # Unit tests (mocks all externals)
yarn test:watch           # Unit tests in watch mode
yarn test:integration     # Integration tests (needs real DB + ngrok)

# Run specific integration tests:
PATTERN=videos yarn test:integration
PATTERN=webhook yarn test:integration
```

## Architecture

### Video Generation Flow

1. User submits prompt + settings → `POST /api/runpod`
2. Backend validates input (auth, role, quota, concurrent job limit of 3), creates DB record
3. Job submitted to RunPod with webhook URL
4. RunPod calls `POST /api/runpod/webhook` with status updates
5. Frontend polls `GET /api/videos?updatedSince={timestamp}` every 20s
6. Failed videos auto-retry with tracked retry count

### Key Directories

- `app/api/` — API routes (runpod, videos, auth/webhook, terms, voucher)
- `lib/` — Core logic: auth, prisma client, rate limiter, monthly quota, model configs
- `lib/models/config.ts` — Model definitions, Zod validation schemas, limits
- `utils/data/` — Data access layer (video/, user/)
- `store/` — Zustand stores (video-store, use-view-store)
- `hooks/` — React hooks; query hooks in hooks/queries, mutation hooks in hooks/mutations
- `components/ui/` — shadcn/ui components

### Data Access

- **Auth**: Clerk (`lib/auth.ts`) — use `auth()` + `requireAuth()` pattern, never old `getAuth()`
- **Database**: Prisma with PostgreSQL (Supabase). Singleton in `lib/prisma.ts`. Uses PgBouncer on port 6543 (pooled) and port 5432 (direct/migrations)
- **Storage**: UploadThing for video files
- **AI Processing**: RunPod SDK running worker-mochi container

### User Roles

`restricted` (default) → `user` (via voucher) → `admin`. Restricted users cannot generate videos.

### Monthly Quota System

`lib/monthly-limit.ts` tracks per-user video generation seconds. Resets monthly (1st of month) or within custom date ranges (`LIMIT_START_DATE`/`LIMIT_END_DATE` env vars). Usage stored as float with 2-decimal precision.

### Terms of Service

Version-based (`lib/terms.ts`). Middleware enforces acceptance on protected routes (e.g., `/my-videos`). Bump `CURRENT_TOS_VERSION` to require re-acceptance.

## Code Conventions

- **Imports**: Always use `@/` prefix absolute imports, never relative. Import sorting is enforced by ESLint (`simple-import-sort`).
- **Components**: Flat in `components/` with kebab-case filenames. Named exports. No barrel/index pattern.
- **TypeScript**: Interfaces over types. Maps over enums. Functional patterns, no classes.
- **React**: Server Components by default. Minimize `use client`, `useEffect`, `setState`. Wrap client components in Suspense.
- **Formatting**: Double quotes, semicolons, trailing commas (ES5), no arrow parens for single params.
- **Database**: snake_case table names, camelCase field names. The Prisma error `The "payload" argument must be of type object. Received null` means a Prisma transaction issue — debug the actual query.
- **shadcn**: Install with `npx shadcn@latest add`

## Testing

- **Unit tests** (`__tests__/api/`): Mock all external dependencies. Run fast in isolation.
- **Integration tests** (`__tests__/integration/`): Use real test DB and ngrok. 30s timeout. Require `yarn dev:test` + ngrok running.
- Test mode (`NEXT_PUBLIC_TEST_MODE=true`) bypasses Clerk auth using test user ID.

## Environment

Requires `.env.local` with: Clerk keys, Supabase DATABASE_URL/DIRECT_URL, RunPod API key/endpoint/webhook token, FRONTEND_URL, NEXT_PUBLIC_APP_URL, MONTHLY_LIMIT_SECONDS. See `.env.example`.
