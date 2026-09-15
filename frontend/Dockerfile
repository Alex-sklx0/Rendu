# --- Dev image (usado por docker-compose para desarrollo local) ---
FROM node:20-alpine AS dev
WORKDIR /app

# Copiar solo manifiestos primero → mejor cache de capas
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# El código fuente llega vía volumen en docker-compose,
# pero lo copiamos aquí también para que la imagen sea standalone.
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build

# --- Production image: archivos estáticos con nginx ---
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
