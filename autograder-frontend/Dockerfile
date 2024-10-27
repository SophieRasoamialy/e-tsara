# Étape de construction
FROM node:16 AS build

# Créer un répertoire de travail
WORKDIR /app

# Copier le package.json et le package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'application
COPY . .

# Construire l'application
RUN npm run build

# Étape de production
FROM nginx:alpine

# Copier les fichiers construits dans le répertoire de contenu de Nginx
COPY --from=build /app/build /usr/share/nginx/html


# Exposer le port 80
EXPOSE 80

# Commande pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
