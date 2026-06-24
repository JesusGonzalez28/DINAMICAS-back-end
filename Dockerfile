FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para bcrypt
RUN apk add --no-cache python3 make g++

# Instalar pnpm compatible con Node 20
RUN npm install -g pnpm@8.15.0

# Copiar package.json
COPY package.json ./

# Instalar TODAS las dependencias incluyendo devDependencies
RUN pnpm install --no-frozen-lockfile

# Copiar todo el código
COPY . .

# Compilar TypeScript con ruta directa al binario
RUN ./node_modules/.bin/nest build

# Verificar que dist existe
RUN ls -la dist/

# Crear carpetas de uploads
RUN mkdir -p uploads/vouchers uploads/prizes

EXPOSE 3000

CMD ["node", "dist/main.js"]
