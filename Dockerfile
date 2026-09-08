# ---- Etapa de build ----
FROM node:22-alpine AS build
WORKDIR /app

# Se copia primero solo el manifiesto de dependencias para cachear "npm ci" en su propia
# capa: cambiar código fuente no vuelve a descargar node_modules en cada build.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx ng build --configuration production

# ---- Etapa de desarrollo (ng serve, la usa docker-compose.override.yml) ----
# Escucha en el 80 para reusar el mapeo de puertos del compose base sin overrides.
FROM node:22-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 80
# --poll: inotify no cruza bien el bind mount de Docker
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "80", "--poll", "1000"]

# ---- Etapa de servido ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
