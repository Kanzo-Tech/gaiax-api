# 1️⃣ Etapa de build
FROM node:20 AS builder

# Crear el directorio de la app
WORKDIR /app

# Copiar package.json y lockfile antes para aprovechar caché de npm install
COPY package*.json ./

# Instalar dependencias (incluye devDependencies para poder compilar TS)
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Compilar a JavaScript en /app/dist
RUN npm run build


# 2️⃣ Etapa final (solo runtime)
FROM node:20-slim

WORKDIR /app

# Copiar solo los archivos necesarios del build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Puerto expuesto
EXPOSE 3000

# Comando de arranque
CMD ["node", "dist/index.js"]
