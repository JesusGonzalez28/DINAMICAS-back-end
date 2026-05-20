FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package files
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS las dependencias incluyendo devDependencies
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Ver qué hay antes del build
RUN ls -la

# Compilar TypeScript
RUN pnpm run build

# Ver qué generó el build
RUN ls -la dist/

# Crear carpeta de uploads
RUN mkdir -p uploads/vouchers uploads/prizes

EXPOSE 3000

CMD ["node", "dist/main"]