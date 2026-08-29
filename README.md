# modulo-world-frontend

SvelteKit + TypeScript frontend for [ModuloWorld](https://moduloworld.com) — a collection of
small games that teach algorithms, mathematics, and music.

Part of a three-repository project:

| Repository                                                                             | Purpose                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **modulo-world-frontend**                                                              | SvelteKit UI, game implementations _(this repo)_ |
| [modulo-world-backend](https://github.com/gislamog/modulo-world-backend)               | NestJS API, Prisma, PostgreSQL                   |
| [modulo-world-infrastructure](https://github.com/gislamog/modulo-world-infrastructure) | Docker Compose, Nginx, deployment                |

All issues and user stories for the whole project are tracked in this repository.

## Architecture

### Request flow

Everything is served from a single origin. Nginx is the only process listening publicly; it
routes by path prefix, so the browser never makes a cross-origin request and no CORS
configuration is needed.

```
                  ┌─────────────┐
                  │   Browser   │
                  └──────┬──────┘
                         │  HTTPS
                         ▼
                  ┌─────────────┐
                  │    Nginx    │  :443 — TLS, single origin
                  └──┬───────┬──┘
             /api/*  │       │  /*
                     ▼       ▼
         ┌───────────────┐ ┌───────────────┐
         │    NestJS     │ │   SvelteKit   │
         │   API :3000   │ │  Node  :3000  │
         └───────┬───────┘ └───────────────┘
                 │  Prisma
                 ▼
         ┌───────────────┐
         │  PostgreSQL   │  :5432 — internal network only
         └───────────────┘
```

Postgres publishes no host port in production; it is reachable only on the internal Docker
network, so the API is the sole path to the data. Locally a port is published for GUI clients
via the infrastructure repo's `compose.override.yaml`.

### Tools

| Tool | Purpose |
|---|---|
| **SvelteKit 2** | Frontend framework — file-based routing, SSR, and the game UI |
| **Svelte 5** | Component runtime, using the runes reactivity model |
| **TypeScript 6** | Static typing across both frontend and backend |
| **Vite 8** | Dev server with hot reload, and production bundler |
| **adapter-node** | Builds SvelteKit to a plain Node server, since the site is self-hosted |
| **NestJS 12** | Backend framework — modular structure, dependency injection |
| **Prisma** | Type-safe database client and migration tool *(story #7)* |
| **PostgreSQL 17** | Relational database — scores, progress, game state |
| **Docker Compose** | Runs every service, identically on Windows and the server |
| **Nginx** | Reverse proxy, TLS termination, single-origin routing |
| **Vitest 4** | Unit and integration tests in both repositories |
| **ESLint + Prettier** | Linting and formatting (frontend); Oxlint in the backend |
| **Oracle Cloud** | Always Free ARM64 host — Ubuntu 22.04 |

### Repository layout

Three repositories, split by deployment unit rather than by feature. Each builds into its own
container image.

| Repository | Contains | Does not contain |
|---|---|---|
| **frontend** | SvelteKit app, game implementations, shared UI, all project issues | API logic, database access |
| **backend** | NestJS API, Prisma schema and migrations, business rules | UI, styling |
| **infrastructure** | Compose files, Nginx config, deployment and TLS setup | Application code |

Issues for all three live in this repository — the project is too small to justify three
issue trackers. A consequence worth knowing: a commit in another repo must write the reference
in full, as `Closes gislamog/modulo-world-frontend#N`, or it closes nothing.

## Prerequisites

- Node.js 24 LTS or newer
- npm 10+

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at http://localhost:5173.

In normal development the full stack runs through Docker Compose from the infrastructure
repository, which puts the frontend and API on a single origin behind Nginx. Running
`npm run dev` alone is fine for UI work that does not call the API.

## Commands

| Command             | Purpose                              |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Development server with hot reload   |
| `npm run build`     | Production build                     |
| `npm run preview`   | Preview the production build locally |
| `npm run check`     | Type-check with svelte-check         |
| `npm run lint`      | Prettier check + ESLint              |
| `npm run format`    | Rewrite files with Prettier          |
| `npm test`          | Run unit tests once                  |
| `npm run test:unit` | Run tests in watch mode              |

## Source layout

```
src/
├── lib/         Shared components, utilities, API client
└── routes/      File-based routing
static/
├── logo.png     Primary logo
└── branding/    Logo candidates and source assets
```

## Branding

`static/logo.png` is the current logo. Alternates are kept in `static/branding/`.
These are unoptimised source files — resizing and compression are tracked as separate work.
