# ---- Etapa 1: build de imagenes (necesita assets/src, data y scripts) ----
FROM node:20-alpine AS build
WORKDIR /app
# EasyPanel pasa los build args definidos en la app; ambos son opcionales.
ARG SITE_URL=""
ARG META_PIXEL_ID=""
ENV SITE_URL=$SITE_URL META_PIXEL_ID=$META_PIXEL_ID
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Etapa 2: nginx sirviendo solo public/ ----
FROM nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/default.conf && mkdir -p /etc/nginx/snippets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-security.conf /etc/nginx/snippets/security.conf
COPY --from=build /app/public/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz | grep -q ok || exit 1
