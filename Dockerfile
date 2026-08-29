# ==============================================================================
# Stage 1: Build the React + Vite Frontend
# ==============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code and build production assets
COPY . .
RUN pnpm build

# ==============================================================================
# Stage 2: Serve with Lightweight Nginx
# ==============================================================================
FROM nginx:alpine

# Copy built static files to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx configuration for Single Page Application (SPA) routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
