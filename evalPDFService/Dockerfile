# Étape 1 : Image de base Python
FROM python:3.9-slim

# Étape 2 : Installer dépendances système
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    build-essential \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Étape 3 : Définir le dossier de travail
WORKDIR /app

# Étape 4 : Copier le fichier requirements.txt
COPY requirements.txt /app/

# Étape 5 : Installer les dépendances Python nécessaires
RUN pip install --no-cache-dir -r requirements.txt

# Étape 6 : Copier tout le code de l'application
COPY . /app

# Étape 7 : Exposer le port Flask
EXPOSE 5000

# Étape 8 : Lancer l’app Flask avec Gunicorn
CMD ["gunicorn", "-w", "2", "-k", "gevent", "-b", "0.0.0.0:5000", "--timeout", "120", "app:app"]
