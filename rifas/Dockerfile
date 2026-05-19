FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Crear carpeta de uploads
RUN mkdir -p uploads/vouchers uploads/prizes

EXPOSE 3000

CMD ["node", "dist/main"]
