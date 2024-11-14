# Étape 1 : Choisir une image de base Python
FROM python:3.9-slim

# Étape 2 : Installer les dépendances système
# Mise à jour de l'index des paquets et installation de dépendances
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    build-essential \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

RUN pip install gevent

# Étape 3 : Créer un répertoire pour l'application
WORKDIR /app

# Étape 4 : Copier les fichiers de l'application
COPY . /app

# Étape 5 : Installer les dépendances Python
# Utilisation d'un fichier requirements.txt pour installer toutes les dépendances
RUN pip install --no-cache-dir -r requirements.txt


# Étape 6 : Exposer le port de l'application Flask
EXPOSE 5000

# Étape 7 : Démarrer l'application Flask avec Gunicorn
CMD ["gunicorn", "-w", "2", "-k", "gevent", "-b", "0.0.0.0:5000", "--timeout", "120", "app:app"]

