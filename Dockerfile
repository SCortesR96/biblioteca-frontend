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

# La imagen oficial de nginx procesa con envsubst cualquier *.template en
# /etc/nginx/templates/ al arrancar el contenedor, generando el .conf real en
# /etc/nginx/conf.d/ — así BACKEND_URL se resuelve en runtime, no en build. El filtro
# restringe la sustitución a esa sola variable: sin él, envsubst también intentaría
# reemplazar los $host/$scheme/etc. propios de nginx (que no son variables de entorno)
# y los dejaría vacíos, rompiendo el proxy.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV BACKEND_URL=http://backend:8080
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL

EXPOSE 80
