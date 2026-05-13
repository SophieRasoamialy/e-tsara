import logging
import re

import fitz

from .config import (
    CAPTURE_INCREMENT,
    MANUAL_CHECK_SYMBOLS,
    MANUAL_LINE_PADDING,
    MAX_CAPTURE_WIDTH,
    MAX_QUESTION_DISTANCE,
    OPTION_PATTERN,
    QUESTION_START_PATTERN,
    STOP_SYMBOLS,
)
from .text_utils import clean_text, normalize_text, rect_to_dict

logger = logging.getLogger(__name__)


def classify_question(question_text, options):
    if "Vrai ou Faux" in question_text:
        return "true_false"
    if "Complétez" in question_text:
        return "fill_in_the_blank"
    if "Soulignez" in question_text:
        return "highlight_the_correct_answer"
    return "multiple_choice" if options else "open_ended"


def expand_bbox(current_bbox, next_bbox):
    if not current_bbox:
        return next_bbox

    return (
        min(current_bbox[0], next_bbox[0]),
        min(current_bbox[1], next_bbox[1]),
        max(current_bbox[2], next_bbox[2]),
        max(current_bbox[3], next_bbox[3]),
    )


def extract_clean_block_data(block):
    if not block or len(block) < 5:
        return None, None

    block_text = block[4] if len(block) > 4 and block[4] is not None else ""
    if not block_text.strip():
        return None, None

    cleaned_text = clean_text(block_text)
    bbox = block[:4] if len(block) >= 4 else None
    if not bbox or not all(isinstance(coord, (int, float)) for coord in bbox):
        return cleaned_text, None

    return cleaned_text, bbox


def split_options_from_block(block_text):
    split_options = OPTION_PATTERN.split(block_text)
    split_options = [item.strip() for item in split_options if item.strip()]
    options = []

    for option in split_options:
        if re.match(r"[A-Da-d]\)|❍", option):
            options.append(option)
        elif options:
            options[-1] += f" {option}"

    return options


def append_detected_question(grouped_questions, question_text, options, bbox, page_num):
    if not question_text:
        return

    grouped_questions.append(
        {
            "question": question_text.strip(),
            "options": options[:],
            "bbox": bbox,
            "page_num": page_num,
            "type": classify_question(question_text, options),
        }
    )


def get_center(rect):
    if rect is None:
        return None
    if rect.x0 == rect.x1 or rect.y0 == rect.y1:
        return None
    return ((rect.x0 + rect.x1) / 2, (rect.y0 + rect.y1) / 2)


def euclidean_distance(center1, center2):
    if center1 is None or center2 is None:
        return float("inf")
    return ((center1[0] - center2[0]) ** 2 + (center1[1] - center2[1]) ** 2) ** 0.5


def extract_text_from_region(page, rect):
    return clean_text(page.get_text("text", clip=rect))


def remove_repetitions(text):
    return re.sub(r"(.)\1+", r"\1", text)


def extract_text_to_right(page, rect):
    full_text = ""
    current_x = rect[2]
    y0 = rect[1] + 5
    y1 = rect[3] - 5

    while current_x < rect[2] + MAX_CAPTURE_WIDTH:
        capture_rect = fitz.Rect(current_x, y0, current_x + CAPTURE_INCREMENT, y1)
        text_to_right = extract_text_from_region(page, capture_rect)
        if any(stop_symbol in text_to_right for stop_symbol in STOP_SYMBOLS):
            break

        full_text += text_to_right
        current_x += CAPTURE_INCREMENT

    if full_text.endswith(" "):
        extended_capture_rect = fitz.Rect(current_x, y0, current_x + CAPTURE_INCREMENT, y1)
        full_text += extract_text_from_region(page, extended_capture_rect)

    return remove_repetitions(clean_text(full_text))


def extract_text_and_annotations(pdf_path):
    grouped_questions = []
    student_info = {}

    current_question = ""
    current_options = []
    current_bbox = None
    current_page_num = None

    with fitz.open(pdf_path) as doc:
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)

            for block in page.get_text("blocks"):
                block_text, bbox = extract_clean_block_data(block)
                if block_text is None:
                    logger.info("Skipping invalid block on page %s: %s", page_num, block)
                    continue
                if bbox is None:
                    logger.info("Invalid bounding box for block on page %s: %s", page_num, block)
                    continue

                if QUESTION_START_PATTERN.match(block_text):
                    append_detected_question(
                        grouped_questions,
                        current_question,
                        current_options,
                        current_bbox,
                        current_page_num,
                    )
                    current_question = block_text
                    current_options = []
                    current_bbox = bbox
                    current_page_num = page_num
                elif OPTION_PATTERN.search(block_text):
                    current_options.extend(split_options_from_block(block_text))
                    current_bbox = expand_bbox(current_bbox, bbox)
                elif current_question:
                    current_question += f" {block_text}"

    append_detected_question(
        grouped_questions,
        current_question,
        current_options,
        current_bbox,
        current_page_num,
    )

    return student_info, grouped_questions


def extract_manual_drawings(page, page_num):
    annotations = []

    for drawing in page.get_drawings():
        for item in drawing["items"]:
            try:
                item_type = item[0]

                if item_type == "re" and isinstance(item[1], (tuple, list)) and len(item[1]) == 4:
                    rect = fitz.Rect(item[1])
                    rect_info = {
                        "type": "manual_box",
                        "rect": rect,
                        "page_num": page_num,
                    }
                    content = extract_text_from_region(page, rect)
                    if content:
                        rect_info["content"] = content
                    annotations.append(rect_info)
                elif item_type == "el":
                    rect = fitz.Rect(item[1])
                    ellipse_info = {
                        "type": "manual_ellipse",
                        "rect": rect,
                        "page_num": page_num,
                    }
                    content = extract_text_from_region(page, rect)
                    if content:
                        ellipse_info["content"] = content
                    annotations.append(ellipse_info)
                elif item_type == "l":
                    from_point = item[1]
                    to_point = item[2]
                    if isinstance(from_point, fitz.Point) and isinstance(to_point, fitz.Point):
                        rect = fitz.Rect(
                            min(from_point.x, to_point.x) - MANUAL_LINE_PADDING,
                            min(from_point.y, to_point.y) - MANUAL_LINE_PADDING,
                            max(from_point.x, to_point.x) + MANUAL_LINE_PADDING,
                            max(from_point.y, to_point.y) + MANUAL_LINE_PADDING,
                        )
                        text_above = extract_text_from_region(page, rect)
                        if text_above:
                            annotations.append(
                                {
                                    "type": "manual_line",
                                    "from": from_point,
                                    "to": to_point,
                                    "page_num": page_num,
                                    "rect": rect,
                                    "text_above": text_above,
                                    "subtype": "manual_underline",
                                }
                            )
                        else:
                            logger.info("Pas de texte detecte autour de la ligne a la page %s.", page_num)
                    else:
                        logger.info(
                            "Points invalides detectes : from_point=%s, to_point=%s",
                            from_point,
                            to_point,
                        )
            except Exception as exc:
                logger.info("Erreur rencontree lors du traitement de l'element : %s, Erreur : %s", item, exc)

    return annotations


def extract_manual_checks(page):
    annotations = []
    text_blocks = page.get_text("dict")["blocks"]

    for block in text_blocks:
        if block["type"] != 0:
            continue

        for line in block["lines"]:
            for span in line["spans"]:
                text = clean_text(span["text"])
                if not any(symbol in text for symbol in MANUAL_CHECK_SYMBOLS):
                    continue

                detected_symbol = next(symbol for symbol in MANUAL_CHECK_SYMBOLS if symbol in text)
                if text.lower() != "x" and "✓" not in text:
                    continue

                rect = fitz.Rect(span["bbox"])
                annotations.append(
                    {
                        "type": "manual_check",
                        "symbol": detected_symbol,
                        "text_symbol": text,
                        "rect": rect,
                        "page_num": page.number,
                        "text": extract_text_to_right(page, rect),
                    }
                )

    return annotations


def find_matching_choice_question(grouped_questions, response_text):
    normalized_response_text = normalize_text(response_text)
    if not normalized_response_text:
        return None, None

    for question in grouped_questions:
        if question["type"] != "multiple_choice":
            continue

        question_rect = fitz.Rect(question["bbox"])
        for option in question["options"]:
            if normalized_response_text in normalize_text(option):
                return question, question_rect

    return None, None


def find_nearest_open_question(grouped_questions, annotation_rect, annotation_center, page_num):
    best_question = None
    best_rect = None
    min_distance = float("inf")
    max_y = float("-inf")

    for question in grouped_questions:
        if question["type"] != "open_ended" or question["page_num"] != page_num:
            continue

        question_rect = fitz.Rect(question["bbox"])
        question_center = get_center(question_rect)
        if question_center is None:
            logger.info(
                "Invalid question rectangle for question on page %s: %s",
                question["page_num"],
                question,
            )
            continue

        distance = euclidean_distance(annotation_center, question_center)
        if distance < min_distance and distance <= MAX_QUESTION_DISTANCE:
            min_distance = distance
            best_question = question
            best_rect = question_rect
        elif question_rect.y1 < annotation_rect.y0 and question_rect.y1 > max_y:
            max_y = question_rect.y1
            best_question = question
            best_rect = question_rect

    return best_question, best_rect


def associate_responses_with_questions(grouped_questions, annotations):
    question_response_mapping = []

    for page_num, annotation_list in annotations.items():
        for annotation in annotation_list:
            if not isinstance(annotation, dict):
                logger.info("Unexpected type for annotation: %s - %s", type(annotation), annotation)
                continue

            annotation_rect = annotation.get("rect")
            if not isinstance(annotation_rect, fitz.Rect):
                logger.info("Unexpected type for annotation rect: %s", type(annotation.get("rect")))
                continue

            response_text = annotation.get("text_above", "").strip()
            found_question = None
            question_rect_final = None
            annotation_type = annotation.get("type")

            if annotation_type == "manual_check" and annotation.get("text"):
                found_question, question_rect_final = find_matching_choice_question(
                    grouped_questions,
                    annotation["text"],
                )
            elif annotation_type == "manual_line" and response_text:
                found_question, question_rect_final = find_matching_choice_question(
                    grouped_questions,
                    response_text,
                )
                if not found_question:
                    annotation_center = get_center(annotation_rect)
                    if annotation_center is None:
                        logger.info(
                            "Invalid annotation rectangle for annotation on page %s: %s",
                            page_num,
                            annotation,
                        )
                        continue

                    found_question, question_rect_final = find_nearest_open_question(
                        grouped_questions,
                        annotation_rect,
                        annotation_center,
                        annotation["page_num"],
                    )

            if found_question and question_rect_final:
                question_response_mapping.append(
                    {
                        "question": found_question["question"],
                        "response": response_text if annotation_type != "manual_check" else annotation["text"],
                        "page_num": page_num,
                        "question_rect": rect_to_dict(question_rect_final),
                    }
                )
            else:
                logger.info("No matching question found for annotation on page %s: %s", page_num, annotation)

    return question_response_mapping


def extract_annotations(doc):
    page_annotations = {}

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        annotations = extract_manual_drawings(page, page_num)
        annotations.extend(extract_manual_checks(page))
        page_annotations[page_num] = annotations

    return page_annotations
