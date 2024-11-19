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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Charger le modèle de sentence-transformers
model = SentenceTransformer('all-MiniLM-L6-v2')

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
    question_rect_final = None

    for page_num, annotation_list in annotations.items():
        for annotation in annotation_list:
            question_rect_final = None
            # Vérifier que l'annotation est bien un dictionnaire
            if not isinstance(annotation, dict):
                print(f"Unexpected type for annotation: {type(annotation)} - {annotation}")
                continue  # Sauter cet élément s'il n'est pas un dictionnaire

            annotation_rect = annotation.get('rect')
            if not isinstance(annotation_rect, fitz.Rect):
                print(f"Unexpected type for annotation rect: {type(annotation.get('rect'))}")
                continue

            response_text = annotation.get('text_above', '').strip()  # Le texte au-dessus de l'annotation
            found_question = None
           
            # Gestion des annotations de type 'manual_check' (cases cochées)
            if annotation['type'] == 'manual_check':
                if len(annotation['text']) > 0:
                    for question in grouped_questions:
                        if question['type'] == 'multiple_choice':
                            question_rect = fitz.Rect(question['bbox'])
                            # Vérifier si la question est proche de l'annotation (au-dessus ou à gauche)
                            question_center = get_center(question_rect)
                            for option in question['options']:
                                # Associer l'option cochée à la question si elle correspond
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
                    # Chercher d'abord une correspondance avec une question à choix multiples
                    for question in grouped_questions:
                        if question['type'] == 'multiple_choice':
                            question_rect = fitz.Rect(question['bbox'])
                            # Vérifier si la question est proche de l'annotation (au-dessus ou à gauche)
                            question_center = get_center(question_rect)
                            for option in question['options']:
                                if normalized_response_text in normalize_text(option):
                                    found_question = question
                                    question_rect_final = question_rect
                                    break
                        if found_question:
                            break

                    # Si aucune correspondance n'est trouvée dans une question multiple-choice,
                    # chercher une question ouverte (open_ended) avec des critères géographiques
                    if not found_question:
                        max_y = -float('inf')
                        annotation_rect = fitz.Rect(annotation['rect'])
                        annotation_center = get_center((annotation_rect.x0, annotation_rect.y0, annotation_rect.x1, annotation_rect.y1))
                        max_distance=100
                        min_distance = float('inf')
                        
                        for question in grouped_questions:
                            if question['type'] == 'open_ended' and question['page_num'] == annotation['page_num']:
                                question_rect = fitz.Rect(question['bbox'])
                                # Vérifier si la question est proche de l'annotation (au-dessus ou à gauche)
                                question_center = get_center(question_rect)

                                # Calculer la distance entre le centre de l'annotation et celui de la question
                                distance = euclidean_distance(annotation_center, question_center)

                                # Vérifier si la question est plus proche que la précédente trouvée
                                if distance < min_distance and distance <= max_distance:
                                    min_distance = distance
                                    found_question = question
                                    #print(f"Found question near annotation with distance: {found_question['question']}")

                                elif question_rect.y1 < annotation_rect.y0:
                                    if question_rect.y1 > max_y:
                                        max_y = question_rect.y1
                                        found_question = question
                                        question_rect_final = question_rect
                                        #print(f"Found question above annotation: {found_question['question']}")
            
           
            # Ajouter la correspondance question-réponse si une correspondance est trouvée
            if found_question:
                # Associer correctement la réponse avec l'annotation ou le texte coché
                question_response_mapping.append({
                    'question': found_question['question'],
                    'response': response_text if annotation['type'] != 'manual_check' else annotation['text'],
                    'page_num': page_num,
                    'question_rect': rect_to_dict(question_rect_final)  # Convertir question_rect en dictionnaire
                })
            else:
                # Message d'erreur pour déboguer les réponses non associées
                print(f"No matching question found for annotation on page {page_num}: {annotation}")

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
    return math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2)


def extract_annotations(doc):
    page_annotations = {}
    # Liste des symboles cochés à rechercher
    symbols_to_check = ["x","X", "✓"]

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        annotations = []

        # Détecter les dessins manuels (rectangles, lignes et cercles)
        drawings = page.get_drawings()
        for drawing in drawings:
            for item in drawing['items']:
                try:
                    # Détection des rectangles (encadrements manuels)
                    if item[0] == 're':  # Détection des rectangles manuels
                        if isinstance(item[1], (tuple, list)) and len(item[1]) == 4:
                            rect_info = {
                                "type": "manual_box",  # Encadrement manuel détecté
                                "rect": fitz.Rect(item[1]),  # Convertir item[1] en objet Rect valide
                                "page_num": page_num,
                            }

                            # Extraire le texte à l'intérieur du rectangle
                            text_inside = page.get_text("text", clip=rect_info["rect"])
                            if clean_text(text_inside):
                                rect_info["content"] = clean_text(text_inside)

                            # Ajouter à la liste des annotations
                            annotations.append(rect_info)

                    # Détection des ellipses (encadrements circulaires manuels)
                    elif item[0] == 'el':  # Détection des ellipses ou cercles
                        ellipse_rect = fitz.Rect(item[1])  # Extraire la boîte englobante de l'ellipse
                        ellipse_info = {
                            "type": "manual_ellipse",  # Encadrement circulaire détecté
                            "rect": ellipse_rect,
                            "page_num": page_num,
                        }

                        # Extraire le texte à l'intérieur de l'ellipse
                        text_inside = page.get_text("text", clip=ellipse_info["rect"])
                        if clean_text(text_inside):
                            ellipse_info["content"] = clean_text(text_inside)

                        # Ajouter à la liste des annotations
                        annotations.append(ellipse_info)

                    elif item[0] == 'l':  # Détection des lignes (soulignements manuels)
                        from_point = item[1]
                        to_point = item[2]

                        if isinstance(from_point, fitz.Point) and isinstance(to_point, fitz.Point):
                            padding = 5  # Augmenter le padding pour capturer plus de texte
                            # Créer un rectangle autour de la ligne
                            rect_from = fitz.Rect(min(from_point.x, to_point.x) - padding,
                                                  min(from_point.y, to_point.y) - padding,
                                                  max(from_point.x, to_point.x) + padding,
                                                  max(from_point.y, to_point.y) + padding)

                            # Extraire le texte au-dessus de la ligne
                            text_above_line = page.get_text("text", clip=rect_from)

                            if clean_text(text_above_line):
                                line_info = {
                                    "type": "manual_line",  # Ligne manuelle
                                    "from": from_point,
                                    "to": to_point,
                                    "page_num": page_num,
                                    "rect": rect_from,  # Ajouter un champ `rect`
                                    "text_above": clean_text(text_above_line),
                                    "subtype": "manual_underline"  # Soulignement manuel
                                }
                                annotations.append(line_info)
                            else:
                                print(f"Pas de texte détecté autour de la ligne à la page {page_num}.")
                        else:
                            print(f"Points invalides détectés : from_point={from_point}, to_point={to_point}")

                except Exception as e:
                    print(f"Erreur rencontrée lors du traitement de l'élément : {item}, Erreur : {e}")

        # Détection du texte manuscrit
        text_blocks = page.get_text("dict")["blocks"]  # Capturer tout le texte sous forme de dictionnaire

        # Liste des caractères ou symboles représentant de nouvelles options de réponse (par ex. "❍", "•", etc.)
        stop_symbols = ["❍", "◯", "❑", "⬜"]

        for block in text_blocks:
            if block["type"] == 0:  # Type 0 = texte imprimé normal
                for line in block["lines"]:
                    for span in line["spans"]:
                        text = clean_text(span["text"])
                        
                        # Rechercher les symboles cochés "X" ou "✓"
                        if any(symbol in text for symbol in symbols_to_check):
                            # Extraire le symbole détecté
                            detected_symbol = [symbol for symbol in symbols_to_check if symbol in text][0]
                            
                            # Si le symbole détecté est 'x'
                            if text == 'x':
                                # Initialiser symbol_info avec les informations disponibles
                                symbol_info = {
                                    "type": "manual_check",
                                    "symbol": detected_symbol,
                                    "text_symbol": text,  # Le texte contenant le symbole
                                    "rect": fitz.Rect(span["bbox"]),  # Coordonnées de la zone du texte
                                    "page_num": page.number
                                }

                                # Initialiser le texte complet capturé à droite du symbole
                                full_text = ""
                                capture_increment = 30  # Largeur de capture pour chaque segment
                                current_x = symbol_info["rect"][2]  # Coordonnée x1 (droite du symbole "x")
                                y0, y1 = symbol_info["rect"][1] + 5, symbol_info["rect"][3] - 5  # Limiter la hauteur de capture
                                max_capture_width = 500  # Largeur maximale à parcourir à droite

                                # Boucle pour capturer le texte à droite du symbole
                                while current_x < symbol_info["rect"][2] + max_capture_width:
                                    # Définir une nouvelle zone de capture pour chaque segment
                                    text_to_right_rect = fitz.Rect(
                                        current_x,  # Coordonnée x1 (droite de la zone précédente)
                                        y0,  # y0 (limite supérieure)
                                        current_x + capture_increment,  # Étendre légèrement à droite
                                        y1  # y1 (limite inférieure)
                                    )
                                    
                                    # Extraire le texte dans cette petite zone
                                    text_to_right = clean_text(page.get_text("text", clip=text_to_right_rect))
                                    
                                    # Arrêter la capture si un symbole d'option est détecté
                                    if any(stop_symbol in text_to_right for stop_symbol in stop_symbols):
                                        break  # Arrêter la capture si une nouvelle option est détectée

                                    # Ajouter le texte capturé au texte complet
                                    full_text += text_to_right
                                    
                                    # Passer à la prochaine section de capture
                                    current_x += capture_increment

                                # Correction des mots coupés à la fin
                                if full_text.endswith(" "):
                                    # Si le texte se termine par un espace, il est possible que le mot soit coupé
                                    extended_capture_rect = fitz.Rect(
                                        current_x,  # Continuer la capture à droite
                                        y0,  # y0 (limite supérieure)
                                        current_x + capture_increment,  # Capturer une petite section supplémentaire
                                        y1  # y1 (limite inférieure)
                                    )
                                    additional_text = clean_text(page.get_text("text", clip=extended_capture_rect))
                                    full_text += additional_text  # Ajouter le texte supplémentaire si nécessaire
                                
                                # Nettoyer les répétitions de caractères (comme "dd" ou "oo")
                                def remove_repetitions(text):
                                    return re.sub(r'(.)\1+', r'\1', text)
                                
                                # Nettoyer le texte final capturé
                                symbol_info["text"] = remove_repetitions(clean_text(full_text))
                                # Ajouter l'annotation avec le texte complet
                                annotations.append(symbol_info)

        page_annotations[page_num] = annotations

    return page_annotations

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
        print("Erreur : format invalide ou clé 'question' manquante dans l'item")
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
                    is_correct = similarity > 0.8  # Vous pouvez ajuster le seuil
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
    logger.info("debut............................................................")
    try:
        pdf_file = request.files['pdf']
        correct_answers = json.loads(request.form.get('correct_answers'))
        pdf_path = "/tmp/tempfile.pdf"
        pdf_file.save(pdf_path)
        logger.info("second................................................................")
        if not pdf_path or not correct_answers:
            logger.warning("Missing pdf_path or correct_answers")
            return jsonify({'error': 'Missing pdf_path or correct_answers'}), 400

        # Nettoyer les réponses correctes
        cleaned_correct_answers = [
            {'answer': clean_html(ans['answer']), 'question': clean_html(ans['question']), 'points': ans['points']}
            for ans in correct_answers
        ]
        logger.info("Correct answers: %s", cleaned_correct_answers)
        logger.info("")

        # Extraire le texte et les annotations du PDF
        student_info, grouped_questions = extract_text_and_annotations(pdf_path)
        doc = fitz.open(pdf_path)
        page_annotations = extract_annotations(doc)
        logger.info("Page annotations: %s", page_annotations)
        logger.info("")

        associated_responses = associate_responses_with_questions(grouped_questions, page_annotations)
        logger.info("Associated responses: %s", associated_responses)
        logger.info("")

        comparison_results = compare_responses(associated_responses, cleaned_correct_answers)
        logger.info("Comparison results: %s", comparison_results)
        logger.info("")

        return jsonify({'results': comparison_results})
    except Exception as e:
        logger.error("An error occurred in analyze_qcm: %s", str(e))
        return jsonify({'error': 'An internal error occurred', 'details': str(e)}), 500



