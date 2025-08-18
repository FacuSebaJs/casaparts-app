# Etapa 1: build de la app con Node.js
FROM node:18-alpine AS build
WORKDIR /app

# Copiar solo los archivos package.json primero para aprovechar el cache de Docker
COPY package*.json ./
RUN npm install --force

# Ahora copiar el resto de los archivos de la app
COPY . .

RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine
COPY --from=build /app/dist/casa-del-renault/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
