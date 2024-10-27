# Étape 1 : Choisir une image de base Python
FROM python:3.9-slim

# Étape 2 : Installer les dépendances système
# Mise à jour de l'index des paquets et installation de dépendances
RUN apt-get update && apt-get install -y \
    build-essential \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Étape 3 : Créer un répertoire pour l'application
WORKDIR /app

# Étape 4 : Copier les fichiers de l'application
COPY . .

# Étape 5 : Installer les dépendances Python
# Utilisation d'un fichier requirements.txt pour installer toutes les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Étape 6 : Exposer le port de l'application Flask
EXPOSE 5000

# Étape 7 : Démarrer l'application Flask
CMD ["python", "app.py"]
