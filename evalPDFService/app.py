from flask import Flask, request, jsonify
import json
import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer, util
from bs4 import BeautifulSoup
import re
import unicodedata
import string
import math
import logging
import cv2
import numpy as np
from PIL import Image
import pytesseract
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Charger le modèle de sentence-transformers
model = SentenceTransformer('all-MiniLM-L6-v2')

def convert_pdf_page_to_image(page, dpi=300):
    """Convertit une page PDF en image pour le traitement OpenCV."""
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi/72, dpi/72))
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

def detect_checkmarks(image):
    """Détecte les cases cochées dans l'image."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                 cv2.THRESH_BINARY_INV, 11, 2)
    
    # Détection des contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    checkmarks = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        aspect_ratio = float(w)/h
        area = cv2.contourArea(cnt)
        
        # Filtrer les marques selon leur taille et forme
        if 0.8 <= aspect_ratio <= 1.2 and 100 <= area <= 1000:
            checkmarks.append((x, y, w, h))
    
    return checkmarks

def detect_underlines(image):
    """Détecte les soulignements dans l'image."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    # Détection des lignes horizontales
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, 
                           minLineLength=50, maxLineGap=10)
    
    underlines = []
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if abs(y2 - y1) < 10:  # Ligne horizontale
                underlines.append((x1, y1, x2, y2))
    
    return underlines

def extract_handwritten_text(image):
    """Extrait le texte manuscrit de l'image en utilisant Tesseract."""
    # Configuration de Tesseract pour le texte manuscrit
    custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 "'
    
    # Prétraitement de l'image
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY_INV, 11, 2)
    
    # Extraction du texte
    text = pytesseract.image_to_string(thresh, config=custom_config)
    return text.strip()

def extract_text_and_annotations(pdf_path):
    doc = fitz.open(pdf_path)
    responses = []
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        img = convert_pdf_page_to_image(page)
        
        # Détection des différents types de réponses
        checkmarks = detect_checkmarks(img)
        underlines = detect_underlines(img)
        
        # Pour chaque marque détectée, extraire le texte environnant
        for check in checkmarks:
            x, y, w, h = check
            # Élargir la zone pour capturer le texte de la question
            roi = img[max(0, y-50):min(img.shape[0], y+h+50),
                     max(0, x-100):min(img.shape[1], x+w+200)]
            text = extract_handwritten_text(roi)
            if text:
                responses.append({
                    'type': 'checkmark',
                    'text': text,
                    'page': page_num,
                    'bbox': (x, y, x+w, y+h)
                })
        
        for line in underlines:
            x1, y1, x2, y2 = line
            # Capturer le texte au-dessus du soulignement
            roi = img[max(0, y1-30):y1,
                     max(0, x1-10):min(img.shape[1], x2+10)]
            text = extract_handwritten_text(roi)
            if text:
                responses.append({
                    'type': 'underline',
                    'text': text,
                    'page': page_num,
                    'bbox': (x1, y1, x2, y2)
                })
        
        # Extraire le texte manuscrit général
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            if block.get("type") == 0:  # Text block
                text = extract_handwritten_text(img[block["bbox"][1]:block["bbox"][3],
                                                 block["bbox"][0]:block["bbox"][2]])
                if text:
                    responses.append({
                        'type': 'handwritten',
                        'text': text,
                        'page': page_num,
                        'bbox': block["bbox"]
                    })
    
    return responses

def compare_responses(annotated_responses, correct_answers, similarity_threshold=0.7):
    """Compare les réponses annotées avec les réponses correctes."""
    results = []
    
    for response in annotated_responses:
        best_match = None
        best_similarity = 0
        
        for answer in correct_answers:
            # Encoder les textes pour la comparaison
            response_encoded = model.encode(response['text'])
            answer_encoded = model.encode(answer['answer'])
            
            # Calculer la similarité
            similarity = util.pytorch_cos_sim(response_encoded, answer_encoded).item()
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = answer
        
        if best_match and best_similarity > similarity_threshold:
            results.append({
                'question': best_match['question'],
                'user_response': response['text'],
                'response_type': response['type'],
                'correct_answer': best_match['answer'],
                'is_correct': best_similarity > 0.9,
                'similarity': best_similarity,
                'points': best_match['points'] if best_similarity > 0.9 else 0,
                'bbox': response['bbox'],
                'page': response['page']
            })
    
    return results
 
@app.route('/analyze_qcm', methods=['POST'])
def analyze_qcm():
    try:
        pdf_file = request.files['pdf']
        correct_answers = json.loads(request.form.get('correct_answers'))
        pdf_path = "/tmp/tempfile.pdf"
        pdf_file.save(pdf_path)
         
        # Extraire les réponses
        responses = extract_text_and_annotations(pdf_path)
        logger.info("responses: %s", responses)
        
        # Comparer avec les réponses correctes
        results = compare_responses(responses, correct_answers)
        logger.info("results: %s", results)
        
        return jsonify({'results': results})
        
    except Exception as e:
        logger.error("An error occurred: %s", str(e))
        return jsonify({'error': str(e)}), 500