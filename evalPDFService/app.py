from flask import Flask, request, jsonify
import json
import fitz  # PyMuPDF
import cv2
import numpy as np
from sentence_transformers import SentenceTransformer, util
from bs4 import BeautifulSoup
import re
import unicodedata
import string
import math
import logging
from PIL import Image
import pytesseract
import io

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Charger le modèle de sentence-transformers
model = SentenceTransformer('all-MiniLM-L6-v2')

def preprocess_scanned_page(page):
    """
    Prétraite une page scannée pour améliorer la détection du texte et des annotations.
    """
    # Convertir la page en image
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Augmenter la résolution
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    
    # Convertir en format numpy pour OpenCV
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    
    # Convertir en niveaux de gris
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    
    # Amélioration du contraste
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    # Débruitage
    denoised = cv2.fastNlMeansDenoising(enhanced)
    
    # Binarisation adaptative
    binary = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )
    
    return binary

def detect_underlines(binary_image):
    """
    Détecte les lignes soulignées dans l'image binaire.
    """
    # Détection des lignes horizontales
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25,1))
    detect_horizontal = cv2.morphologyEx(binary_image, cv2.MORPH_OPEN, horizontal_kernel)
    
    # Trouver les contours des lignes
    contours, _ = cv2.findContours(
        detect_horizontal, 
        cv2.RETR_EXTERNAL, 
        cv2.CHAIN_APPROX_SIMPLE
    )
    
    underlines = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 30 and h < 5:  # Filtrer les lignes pertinentes
            underlines.append((x, y, x+w, y+h))
            
    return underlines

def extract_text_above_underline(binary_image, underline, max_height=30):
    """
    Extrait le texte au-dessus d'une ligne soulignée.
    """
    x, y, x2, y2 = underline
    # Région d'intérêt au-dessus de la ligne
    roi = binary_image[max(0, y-max_height):y, x:x2]
    
    # Utiliser Tesseract pour extraire le texte
    text = pytesseract.image_to_string(
        Image.fromarray(roi), 
        config='--psm 6'  # Suppose que le texte est uniforme
    )
    
    return clean_text(text)

def extract_annotations(doc):
    page_annotations = {}
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        annotations = []
        
        # Prétraitement de la page scannée
        binary_image = preprocess_scanned_page(page)
        
        # Détection des soulignements
        underlines = detect_underlines(binary_image)
        
        # Extraire le texte pour chaque soulignement
        for underline in underlines:
            text = extract_text_above_underline(binary_image, underline)
            if text:
                annotation_info = {
                    "type": "manual_line",
                    "rect": fitz.Rect(underline),
                    "text_above": text,
                    "page_num": page_num
                }
                annotations.append(annotation_info)
        
        # Détection des cases cochées
        checkboxes = detect_checkboxes(binary_image)
        for checkbox in checkboxes:
            if is_checkbox_checked(binary_image, checkbox):
                # Extraire le texte à côté de la case cochée
                checkbox_text = extract_checkbox_text(binary_image, checkbox)
                annotation_info = {
                    "type": "manual_check",
                    "rect": fitz.Rect(checkbox),
                    "text": checkbox_text,
                    "page_num": page_num
                }
                annotations.append(annotation_info)
        
        page_annotations[page_num] = annotations
    
    return page_annotations

def detect_checkboxes(binary_image):
    """
    Détecte les cases à cocher dans l'image.
    """
    # Création d'un masque pour détecter les formes carrées/rectangulaires
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20,20))
    morphed = cv2.morphologyEx(binary_image, cv2.MORPH_CLOSE, kernel)
    
    # Trouver les contours
    contours, _ = cv2.findContours(
        morphed, 
        cv2.RETR_EXTERNAL, 
        cv2.CHAIN_APPROX_SIMPLE
    )
    
    checkboxes = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = float(w)/h
        # Filtrer les rectangles qui ressemblent à des cases à cocher
        if 0.8 <= aspect_ratio <= 1.2 and 15 <= w <= 30:
            checkboxes.append((x, y, x+w, y+h))
            
    return checkboxes

def is_checkbox_checked(binary_image, checkbox):
    """
    Détermine si une case à cocher est cochée.
    """
    x, y, x2, y2 = checkbox
    roi = binary_image[y:y2, x:x2]
    
    # Calculer le pourcentage de pixels noirs
    black_pixels = np.sum(roi == 0)
    total_pixels = roi.size
    
    # Si plus de 20% des pixels sont noirs, considérer comme coché
    return (black_pixels / total_pixels) > 0.2

def extract_checkbox_text(binary_image, checkbox, max_width=200):
    """
    Extrait le texte à côté d'une case à cocher.
    """
    x, y, x2, y2 = checkbox
    # Région d'intérêt à droite de la case
    roi = binary_image[y:y2, x2:min(x2+max_width, binary_image.shape[1])]
    
    # Utiliser Tesseract pour extraire le texte
    text = pytesseract.image_to_string(
        Image.fromarray(roi),
        config='--psm 6'
    )
    
    return clean_text(text)

def normalize_text(text,remove_spaces=True):
    # Convertir en minuscules
    text = text.lower()

    # Supprimer les accents
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')

    # Supprimer la ponctuation
    text = text.translate(str.maketrans('', '', string.punctuation))

    # Supprimer les espaces multiples et les espaces au début/fin
    text = ' '.join(text.split())

    # Supprimer les espaces si l'option est activée
    if remove_spaces:
        text = text.replace(" ", "")

    return text


def encode_text(text):
    encoded = model.encode(text, convert_to_tensor=True)
    return encoded

def clean_text(text):
    """Nettoyer le texte en supprimant les espaces supplémentaires et les retours à la ligne superflus."""
    return ' '.join(text.split()).strip()

def clean_html(text):
    """Supprimer les balises HTML du texte."""
    soup = BeautifulSoup(text, 'html.parser')
    return clean_text(soup.get_text())

def rect_to_dict(rect):
    """ Convertit un objet fitz.Rect en un dictionnaire serializable en JSON. """
    return {
        'x0': rect.x0,
        'y0': rect.y0,
        'x1': rect.x1,
        'y1': rect.y1
    }

def extract_text_and_annotations(pdf_path):
    doc = fitz.open(pdf_path)
    grouped_questions = []
    student_info = {}  # Dictionnaire pour stocker les informations de l'étudiant

    current_question = ""  # Question en cours de traitement
    current_options = []  # Options associées à la question
    current_bbox = None  # Boîte englobante de la question et des options
    current_page_num = None  # Page de la question

    def save_question():
        """Sauvegarde la question actuelle dans grouped_questions si elle existe."""
        if current_question:  # Assurer qu'il y a bien une question
            question_type = 'multiple_choice' if current_options else 'open_ended'  # Déterminer le type de question
            grouped_questions.append({
                'question': current_question.strip(),
                'options': current_options[:],  # Copie de la liste des options
                'bbox': current_bbox,  # Bounding box de la question
                'page_num': current_page_num,  # Numéro de la page
                'type': question_type  # Type de la question : multiple_choice ou open_ended
            })

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        blocks = list(page.get_text('blocks'))

        for block in blocks:
            # Vérification et extraction du texte
            if block and len(block) >= 5 and block[4] is not None:
                block_text = clean_text(block[4])
                bbox = block[:4]  # Coordonnées de la boîte englobante du texte

                # Détection des questions numérotées (ex: ➊, ➋, 1), etc.
                if re.match(r'(\d+\)|[➊➋➌➍➎➏➐➑➒])', block_text.strip()):
                    save_question()  # Sauvegarder la question précédente avant de passer à la suivante

                    # Initialiser une nouvelle question
                    current_question = block_text
                    current_options = []  # Réinitialiser les options
                    current_bbox = bbox  # Enregistrer la boîte englobante de la question
                    current_page_num = page_num  # Enregistrer la page

                # Détection des options de réponses (ex: ❍a., ❍b.) et gestion de plusieurs options dans une seule ligne
                elif re.search(r'(❍[a-d]\.|[a-d]\.)', block_text.strip()):
                    # Si plusieurs options sont présentes dans une seule ligne, on les divise
                    options_in_block = re.split(r'(❍[a-d]\.|[a-d]\.)', block_text)
                    options_in_block = [opt.strip() for opt in options_in_block if opt.strip()]  # Nettoyer la liste

                    # Ajouter chaque option individuellement
                    for option in options_in_block:
                        if re.match(r'[a-d]\.|❍', option):
                            current_options.append(option)
                        else:
                            # Si l'option n'a pas le préfixe correct, on l'ajoute à la dernière option
                            current_options[-1] += " " + option

                    # Ajuster la bounding box pour inclure la nouvelle option
                    current_bbox = (
                        min(current_bbox[0], bbox[0]),
                        min(current_bbox[1], bbox[1]),
                        max(current_bbox[2], bbox[2]),
                        max(current_bbox[3], bbox[3])
                    )

    save_question()  # Sauvegarder la dernière question après la fin de la boucle

    return student_info, grouped_questions

def associate_responses_with_questions(grouped_questions, annotations):
    question_response_mapping = []

    for page_num, annotation_list in annotations.items():
        for annotation in annotation_list:
            # Vérifier que l'annotation est bien un dictionnaire
            if not isinstance(annotation, dict):
                logger.info(f"Unexpected type for annotation: {type(annotation)} - {annotation}")
                continue

            annotation_rect = annotation.get('rect')
            if not isinstance(annotation_rect, fitz.Rect):
                logger.info(f"Unexpected type for annotation rect: {type(annotation.get('rect'))}")
                continue

            response_text = annotation.get('text_above', '').strip()
            found_question = None
            question_rect_final = None  # Initialisation de question_rect_final
           
            # Gestion des annotations de type 'manual_check' (cases cochées)
            if annotation['type'] == 'manual_check':
                if len(annotation['text']) > 0:
                    for question in grouped_questions:
                        if question['type'] == 'multiple_choice':
                            question_rect = fitz.Rect(question['bbox'])
                            # Vérifier si la question est proche de l'annotation
                            for option in question['options']:
                                if normalize_text(annotation['text']) in normalize_text(option):
                                    found_question = question
                                    question_rect_final = question_rect
                                    break
                        if found_question:
                            break

            # Gestion des annotations de type 'manual_line'
            elif annotation['type'] == 'manual_line':
                normalized_response_text = normalize_text(response_text)
                if len(response_text) > 0:
                    # Chercher une correspondance avec une question à choix multiples
                    for question in grouped_questions:
                        if question['type'] == 'multiple_choice':
                            question_rect = fitz.Rect(question['bbox'])
                            for option in question['options']:
                                if normalized_response_text in normalize_text(option):
                                    found_question = question
                                    question_rect_final = question_rect
                                    break
                        if found_question:
                            break

                    # Si aucune correspondance n'est trouvée, chercher une question ouverte
                    if not found_question:
                        max_y = -float('inf')
                        annotation_rect = fitz.Rect(annotation['rect'])
                        annotation_center = get_center((annotation_rect.x0, annotation_rect.y0, annotation_rect.x1, annotation_rect.y1))
                        max_distance = 100
                        min_distance = float('inf')
                        
                        for question in grouped_questions:
                            if question['type'] == 'open_ended' and question['page_num'] == annotation['page_num']:
                                question_rect = fitz.Rect(question['bbox'])
                                question_center = get_center(question_rect)
                                distance = euclidean_distance(annotation_center, question_center)

                                if distance < min_distance and distance <= max_distance:
                                    min_distance = distance
                                    found_question = question
                                    question_rect_final = question_rect
                                elif question_rect.y1 < annotation_rect.y0:
                                    if question_rect.y1 > max_y:
                                        max_y = question_rect.y1
                                        found_question = question
                                        question_rect_final = question_rect
            
            # Ajouter la correspondance question-réponse uniquement si une question et son rectangle sont trouvés
            if found_question and question_rect_final:
                question_response_mapping.append({
                    'question': found_question['question'],
                    'response': response_text if annotation['type'] != 'manual_check' else annotation['text'],
                    'page_num': page_num,
                    'question_rect': rect_to_dict(question_rect_final)
                })
            else:
                logger.info(f"No matching question found for annotation on page {page_num}: {annotation}")

    return question_response_mapping
 
def get_center(rect):
    """
    Calcule le centre d'un rectangle.
    """
    x_center = (rect[0] + rect[2]) / 2
    y_center = (rect[1] + rect[3]) / 2
    return (x_center, y_center)

def euclidean_distance(point1, point2):
    """
    Calcule la distance euclidienne entre deux points.
    """
    return math.sqrt((point1[0] - point2[0]) * 2 + (point1[1] - point2[1]) * 2)



def separate_question_options(item):
    # Vérifiez que l'item est un dictionnaire contenant une clé 'question'
    if isinstance(item, dict) and 'question' in item:
        question_text = item['question']
        
        # Extraire les options dans le texte de la question
        options_text = re.findall(r'[❍◯❑⬜]\s?[a-d]\.\s?[^\n]+', question_text)
        
        # Supprimer les options du texte pour n'obtenir que la question
        question = re.split(r'[❍◯❑⬜]\s?[a-d]\.', question_text)[0].strip()
        
        # Retourner la question et les options
        return {
            'question': question,
            'options': options_text if options_text else [],
            'type': 'multiple_choice' if options_text else 'open_ended'
        }
    else:
        logger.info("Erreur : format invalide ou clé 'question' manquante dans l'item")
        return None
def compare_responses(annotated, correct_answers):
    results = []
    for annotated_data in annotated:
        correct_answer = None
        normalize_annotated_question = normalize_text(annotated_data['question'])
        
        # Trouver la réponse correcte pour la question
        #correct_answer = next((ans['answer'] for ans in correct_answers if normalize_question(ans['question']) == normalize_text(question)), None)
        for correct_data in correct_answers:
            separate_correct_question = separate_question_options(correct_data)
            normalize_separated_correct_question = normalize_text(separate_correct_question['question'])
           
            if(normalize_annotated_question in normalize_separated_correct_question):
                
                correct_answer = correct_data['answer']
               
                user_response = annotated_data['response']
               
                if correct_answer:
                    # Utiliser la similarité cosinus pour comparer les réponses
                    user_encoded = encode_text(user_response)
                    correct_encoded = encode_text(correct_answer)
                    similarity = util.pytorch_cos_sim(user_encoded, correct_encoded).item()

                    # Si la similarité est élevée, on considère que la réponse est correcte
                    is_correct = similarity > 0.7  # Vous pouvez ajuster le seuil
                    rect = annotated_data['question_rect']
                    
                    results.append({
                        'question': correct_data['question'],
                        'user_response': user_response,
                        'correct_answer': correct_answer,
                        'is_correct': is_correct,
                        'similarity': similarity,
                        'points': correct_data['points'] if is_correct else 0,
                        'question_rect': rect,
                    })
                else: 
                    results.append({
                        'question': correct_data['question'],
                        'user_response': user_response,
                        'correct_answer': None,
                        'is_correct': False,
                        'similarity': 0.0,
                        'points': 0,
                        'question_rect': rect,
                    })

                break
    return results
 
@app.route('/analyze_qcm', methods=['POST'])
def analyze_qcm():
    try:
        pdf_file = request.files['pdf']
        correct_answers = json.loads(request.form.get('correct_answers'))
        pdf_path = "/tmp/tempfile.pdf"
        pdf_file.save(pdf_path)

        if not pdf_path or not correct_answers:
            return jsonify({'error': 'Missing pdf_path or correct_answers'}), 400

        # Nettoyer les réponses correctes
        cleaned_correct_answers = [{'answer': clean_html(ans['answer']), 'question': clean_html(ans['question']), 'points': ans['points']} for ans in correct_answers]

        # Extraire le texte et les annotations du PDF
        student_info, grouped_questions = extract_text_and_annotations(pdf_path)
        logger.info("grouped questions>>>>>> %s", grouped_questions)
        logger.info("")
        # Ouvrir le document PDF
        doc = fitz.open(pdf_path)

        # Extraire les annotations spécifiques des réponses des étudiants
        page_annotations = extract_annotations(doc)
        logger.info("page annotations >>>>>>> %s", page_annotations)
        logger.info("")

        # Associer les annotations des réponses aux questions
        associated_responses = associate_responses_with_questions(grouped_questions, page_annotations)
        logger.info("associated_responses>>>>>>>>> %s", associated_responses)
        logger.info("")

        # Comparer les réponses annotées avec les réponses correctes
        comparison_results = compare_responses(associated_responses, cleaned_correct_answers)
        logger.info("comparison_results: %s",comparison_results)

        return jsonify({'results': comparison_results})

    except Exception as e:
        logger.error("An error occurred in analyze_qcm: %s", str(e))
        return jsonify({'error': 'An internal error occurred', 'details': str(e)}), 500



