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

## Layout

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
