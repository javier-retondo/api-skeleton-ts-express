FROM node:18

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

RUN apt-get update && apt-get install wkhtmltopdf -y

# Instalar dependencias
RUN npm install
RUN npm install -g typescript pm2
RUN npm run build

# Copiar el resto del código fuente
COPY . .

# Comando por defecto para el contenedor
CMD ["pm2-runtime", "start", "./dist/app.js"]
