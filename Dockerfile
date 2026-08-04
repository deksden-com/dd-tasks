FROM node:22-bookworm-slim AS build

ENV CI=true
WORKDIR /workspace
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json biome.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

COPY . .

ARG SOURCE_REVISION=unknown
ARG ARTIFACT_DIGEST=unknown
ARG BUILD_RUN_ID=unknown
ARG BUILD_TIMESTAMP=unknown
RUN pnpm --filter @dd-tasks/web build \
  && pnpm --filter @dd-tasks/api build \
  && pnpm deploy --legacy --filter @dd-tasks/api --prod /runtime-api \
  && printf '{"sourceRevision":"%s","artifactDigest":"%s","buildRunId":"%s","builtAt":"%s"}\n' \
    "$SOURCE_REVISION" "$ARTIFACT_DIGEST" "$BUILD_RUN_ID" "$BUILD_TIMESTAMP" \
    > /workspace/build-metadata.json

FROM node:22-bookworm-slim AS runtime

ARG SOURCE_REVISION=unknown
ARG ARTIFACT_DIGEST=unknown
LABEL org.opencontainers.image.revision="$SOURCE_REVISION" \
  org.opencontainers.image.digest="$ARTIFACT_DIGEST"

WORKDIR /app
ENV NODE_ENV=production \
  HOST=0.0.0.0 \
  PORT=8787 \
  WEB_DIST_DIR=/app/web-dist \
  MIGRATIONS_DIR=/app/drizzle \
  BUILD_METADATA_PATH=/app/build-metadata.json

COPY --from=build /runtime-api/ ./
COPY --from=build /workspace/apps/web/dist ./web-dist
COPY --from=build /workspace/apps/api/drizzle ./drizzle
COPY --from=build /workspace/build-metadata.json ./build-metadata.json

USER node
EXPOSE 8787
HEALTHCHECK --interval=5s --timeout=3s --retries=20 CMD node -e "fetch('http://127.0.0.1:8787/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/server.js"]
