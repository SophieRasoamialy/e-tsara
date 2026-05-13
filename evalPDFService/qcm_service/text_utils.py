from difflib import SequenceMatcher
import html
import re
import string
import unicodedata

from .config import (
    LOCAL_CORRECT_THRESHOLD,
    QUESTION_OPTION_PATTERN,
    QUESTION_OPTION_SPLIT_PATTERN,
)


def normalize_text(text, remove_spaces=True):
    if text is None:
        return ""
    if not isinstance(text, str):
        text = str(text)

    text = text.lower()
    text = unicodedata.normalize("NFKD", text).encode("ASCII", "ignore").decode("utf-8")
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = " ".join(text.split())

    if remove_spaces:
        text = text.replace(" ", "")

    return text


def clean_text(text):
    return " ".join((text or "").split()).strip()


def clean_html(text):
    without_tags = re.sub(r"<[^>]+>", " ", text or "")
    return clean_text(html.unescape(without_tags))


def rect_to_dict(rect):
    return {
        "x0": rect.x0,
        "y0": rect.y0,
        "x1": rect.x1,
        "y1": rect.y1,
    }


def separate_question_options(item, logger=None):
    if isinstance(item, dict):
        question_text = item.get("question")
    elif isinstance(item, str):
        question_text = item
    else:
        if logger:
            logger.info("Erreur : format invalide pour l'extraction de question: %s", type(item))
        return None

    if not question_text:
        if logger:
            logger.info("Erreur : texte de question manquant dans l'item")
        return None

    options_text = QUESTION_OPTION_PATTERN.findall(question_text)
    question = QUESTION_OPTION_SPLIT_PATTERN.split(question_text)[0].strip()

    return {
        "question": question,
        "options": options_text if options_text else [],
        "type": "multiple_choice" if options_text else "open_ended",
    }


def extract_choice_label(text):
    if not text:
        return None

    text = clean_text(text)
    match = re.search(r"\b([A-Da-d])[\)\.]", text)
    if match:
        return match.group(1).lower()

    normalized = text.lower()
    if normalized in {"a", "b", "c", "d"}:
        return normalized

    return None


def strip_choice_prefix(text):
    return re.sub(r"^\s*[A-Da-d][\)\.]\s*", "", text or "").strip()


def token_set(text):
    normalized = normalize_text(text, remove_spaces=False)
    if not normalized:
        return set()
    return {token for token in normalized.split() if token}


def token_overlap_score(left, right):
    left_tokens = token_set(left)
    right_tokens = token_set(right)

    if not left_tokens or not right_tokens:
        return 0.0

    intersection = len(left_tokens & right_tokens)
    union = len(left_tokens | right_tokens)
    coverage = intersection / max(1, min(len(left_tokens), len(right_tokens)))
    jaccard = intersection / union
    return max(jaccard, coverage)


def sequence_similarity(left, right):
    normalized_left = normalize_text(left, remove_spaces=False)
    normalized_right = normalize_text(right, remove_spaces=False)

    if not normalized_left or not normalized_right:
        return 0.0

    return SequenceMatcher(None, normalized_left, normalized_right).ratio()


def char_ngram_score(left, right, n=3):
    normalized_left = normalize_text(left)
    normalized_right = normalize_text(right)

    if not normalized_left or not normalized_right:
        return 0.0

    if len(normalized_left) < n or len(normalized_right) < n:
        return 1.0 if normalized_left == normalized_right else 0.0

    left_ngrams = {
        normalized_left[index:index + n]
        for index in range(len(normalized_left) - n + 1)
    }
    right_ngrams = {
        normalized_right[index:index + n]
        for index in range(len(normalized_right) - n + 1)
    }

    intersection = len(left_ngrams & right_ngrams)
    union = len(left_ngrams | right_ngrams)
    return intersection / union if union else 0.0


def local_similarity_score(user_response, correct_answer):
    normalized_user = normalize_text(user_response, remove_spaces=False)
    normalized_correct = normalize_text(correct_answer, remove_spaces=False)

    if not normalized_user or not normalized_correct:
        return 0.0

    if normalized_user == normalized_correct:
        return 1.0

    compact_user = normalize_text(user_response)
    compact_correct = normalize_text(correct_answer)
    if compact_user and compact_correct:
        if compact_user in compact_correct or compact_correct in compact_user:
            return 0.92

    token_score = token_overlap_score(user_response, correct_answer)
    sequence_score = sequence_similarity(user_response, correct_answer)
    ngram_score = char_ngram_score(user_response, correct_answer)

    return max(
        token_score * 0.45 + sequence_score * 0.35 + ngram_score * 0.20,
        token_score,
        sequence_score * 0.9,
    )


def is_multiple_choice_text(text):
    return extract_choice_label(text) is not None


def score_choice_answer(user_response, correct_answer):
    user_label = extract_choice_label(user_response)
    correct_label = extract_choice_label(correct_answer)

    if user_label and correct_label:
        similarity = 1.0 if user_label == correct_label else 0.0
        return similarity, similarity >= 1.0

    user_text = strip_choice_prefix(user_response)
    correct_text = strip_choice_prefix(correct_answer)
    similarity = local_similarity_score(user_text, correct_text)
    return similarity, similarity >= LOCAL_CORRECT_THRESHOLD
