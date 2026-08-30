# Production image. Unlike Dockerfile.dev, which bind-mounts the source and
# runs Vite, this compiles the site and ships only what is needed to serve
# it. Built for linux/arm64 in CI to match the Oracle Ampere server.

# ---- build ----
FROM node:24-alpine AS build

WORKDIR /app

# Manifests first, so this layer is cached until dependencies change.
COPY package.json package-lock.json ./
# The full dependency set: the build needs Vite and the Svelte compiler,
# which are devDependencies.
RUN npm ci

COPY . .

RUN npm run build

# Drop to production dependencies only, so the next stage copies a
# node_modules without the build toolchain in it.
RUN npm prune --omit=dev

# ---- runtime ----
FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
# adapter-node reads these. Binding to localhost would leave the server
# unreachable from nginx, which is a separate container.
ENV HOST=0.0.0.0
ENV PORT=3000

# Run as a non-root user. The node image ships one, so there is no need
# to create it.
USER node

# build/ is what adapter-node emits: a self-contained server entry plus
# the client assets. The source and the Vite config are not needed.
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json

EXPOSE 3000

# No healthcheck here: nginx fronts this container and compose defines
# the check. Keeping it in one place avoids two definitions drifting.
CMD ["node", "build"]
