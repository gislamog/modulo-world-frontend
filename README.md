# modulo-world-frontend

SvelteKit + TypeScript frontend for [ModuloWorld](https://moduloworld.com). A collection of
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
                  │    Nginx    │  :443  TLS, single origin
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
         │  PostgreSQL   │  :5432  internal network only
         └───────────────┘
```

Postgres publishes no host port in production; it is reachable only on the internal Docker
network, so the API is the sole path to the data. Locally a port is published for GUI clients
via the infrastructure repo's `compose.override.yaml`.

### Containers

Four containers, which do not map one-to-one onto the three repositories. The infrastructure
repository builds nothing of its own: it holds the Compose files and Nginx config that define
and wire up the others.

| Container  | Built from                                            | Role                                                            |
| ---------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| `nginx`    | official image plus config in the infrastructure repo | Routes by path prefix. The only container publishing a web port |
| `frontend` | this repository, `Dockerfile.dev`                     | SvelteKit dev server with hot reload                            |
| `api`      | the backend repository, `Dockerfile.dev`              | NestJS API, waits for a healthy database before starting        |
| `postgres` | official `postgres:17.2-alpine` image                 | Database. No host port in production                            |

### Tools

| Tool                  | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| **SvelteKit 2**       | Frontend framework. File-based routing, SSR, and the game UI           |
| **Svelte 5**          | Component runtime, using the runes reactivity model                    |
| **TypeScript 6**      | Static typing across both frontend and backend                         |
| **Vite 8**            | Dev server with hot reload, and production bundler                     |
| **adapter-node**      | Builds SvelteKit to a plain Node server, since the site is self-hosted |
| **NestJS 12**         | Backend framework. Modular structure, dependency injection             |
| **Prisma**            | Type-safe database client and migration tool _(story #7)_              |
| **PostgreSQL 17**     | Relational database. Scores, progress, game state                      |
| **Docker Compose**    | Runs every service, identically on Windows and the server              |
| **Nginx**             | Reverse proxy, TLS termination, single-origin routing                  |
| **Vitest 4**          | Unit and integration tests in both repositories                        |
| **ESLint + Prettier** | Linting and formatting (frontend); Oxlint in the backend               |
| **Oracle Cloud**      | Always Free ARM64 host running Ubuntu 22.04                            |

### Repository layout

Three repositories, split by deployment unit rather than by feature. Each builds into its own
container image.

| Repository         | Contains                                                           | Does not contain           |
| ------------------ | ------------------------------------------------------------------ | -------------------------- |
| **frontend**       | SvelteKit app, game implementations, shared UI, all project issues | API logic, database access |
| **backend**        | NestJS API, Prisma schema and migrations, business rules           | UI, styling                |
| **infrastructure** | Compose files, Nginx config, deployment and TLS setup              | Application code           |

Issues for all three live in this repository, because the project is too small to justify
three issue trackers. A consequence worth knowing: a commit in another repo must write the reference
in full, as `Closes gislamog/modulo-world-frontend#N`, or it closes nothing.

## Prerequisites

- Node.js 24 LTS or newer
- npm 10+

## Setup

### Full stack

One command, from the infrastructure repository, starts all four containers with hot reload:

```bash
cd ../modulo-world-infrastructure
cp .env.example .env   # then fill in the credentials
docker compose up -d
```

The site is then at http://localhost (or whichever `HTTP_PORT` is set in that `.env`).
Frontend edits hot reload, and backend edits trigger a Nest watch-mode restart, both without
rebuilding anything.

### Frontend alone

For UI work that does not call the API:

```bash
npm install
cp .env.example .env
npm run dev
```

That runs at http://localhost:5173, without Nginx, the API, or the database.

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
These are unoptimised source files. Resizing and compression are tracked as separate work.
