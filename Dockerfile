# Stage 1: Build
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

# Vite bakes VITE_* env vars into the client bundle at build time.
ARG VITE_BASE_URL=https://api.kauindex.com
ARG VITE_GEN_BASE_URL=https://api-schedly.y-tools.xyz
ARG VITE_IN_DEVELOPMENT=no
ENV VITE_BASE_URL=$VITE_BASE_URL \
    VITE_GEN_BASE_URL=$VITE_GEN_BASE_URL \
    VITE_IN_DEVELOPMENT=$VITE_IN_DEVELOPMENT

RUN pnpm run build

# Stage 2: Production
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
