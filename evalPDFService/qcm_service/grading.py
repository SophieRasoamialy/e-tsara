import json
import logging

import requests

from .config import (
    LOCAL_CORRECT_THRESHOLD,
    OPENAI_API_KEY,
    OPENAI_GRADING_ENABLED,
    OPENAI_MODEL,
    OPENAI_RESPONSES_URL,
    OPENAI_TIMEOUT_SECONDS,
    QUESTION_MATCH_THRESHOLD,
)
from .text_utils import (
    clean_html,
    extract_choice_label,
    is_multiple_choice_text,
    local_similarity_score,
    score_choice_answer,
    separate_question_options,
    token_overlap_score,
    normalize_text,
)

logger = logging.getLogger(__name__)
_openai_grade_cache = {}


def build_cleaned_correct_answers(correct_answers):
    return [
        {
            "answer": clean_html(answer.get("answer")),
            "question": clean_html(answer.get("question")),
            "points": answer.get("points", 0),
        }
        for answer in correct_answers
    ]


def openai_grading_available():
    return bool(OPENAI_API_KEY and OPENAI_GRADING_ENABLED)


def extract_output_text(response_body):
    output_text_parts = []

    for item in response_body.get("output", []):
        if item.get("type") != "message":
            continue

        for content in item.get("content", []):
            if content.get("type") == "output_text":
                output_text_parts.append(content.get("text", ""))

    return "".join(output_text_parts).strip()


def parse_openai_json_response(response_body):
    output_text = extract_output_text(response_body)
    if output_text:
        return json.loads(output_text)

    for item in response_body.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "json_schema":
                return content.get("json", {})

    raise ValueError("No structured JSON content found in OpenAI response")


def grade_with_openai(question_text, user_response, correct_answer, max_points):
    cache_key = (question_text, user_response, correct_answer, max_points)
    if cache_key in _openai_grade_cache:
        return _openai_grade_cache[cache_key]

    answer_kind = (
        "multiple_choice"
        if is_multiple_choice_text(user_response) or is_multiple_choice_text(correct_answer)
        else "open_ended"
    )

    payload = {
        "model": OPENAI_MODEL,
        "store": False,
        "input": [
            {
                "role": "developer",
                "content": (
                    "You are a strict but fair exam grader. Return JSON only. "
                    "Grade the student answer against the reference answer. "
                    "Award a number of points between 0 and the provided max_points. "
                    "Use partial credit only when the student answer is meaningfully partially correct. "
                    "For multiple-choice answers, accept only the correct option or an exact equivalent option text. "
                    "If the answer is contradictory, irrelevant, or materially incomplete, award 0."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Question type: {answer_kind}\n\n"
                    f"Question:\n{question_text}\n\n"
                    f"Reference answer:\n{correct_answer}\n\n"
                    f"Student answer:\n{user_response}\n\n"
                    f"Maximum points:\n{max_points}\n\n"
                    "Return a similarity score between 0 and 1, whether the answer should count as correct overall, "
                    "and the number of points awarded."
                ),
            },
        ],
        "text": {
            "format": {
                "type": "json_schema",
                "name": "grading_result",
                "strict": True,
                "schema": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "similarity": {
                            "type": "number",
                            "minimum": 0,
                            "maximum": 1,
                        },
                        "is_correct": {
                            "type": "boolean",
                        },
                        "awarded_points": {
                            "type": "number",
                            "minimum": 0,
                            "maximum": max_points,
                        },
                    },
                    "required": ["similarity", "is_correct", "awarded_points"],
                },
            }
        },
    }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            OPENAI_RESPONSES_URL,
            headers=headers,
            json=payload,
            timeout=OPENAI_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        response_body = response.json()
        parsed = parse_openai_json_response(response_body)

        result = {
            "similarity": max(0.0, min(1.0, float(parsed["similarity"]))),
            "is_correct": bool(parsed["is_correct"]),
            "awarded_points": max(0.0, min(float(max_points), float(parsed["awarded_points"]))),
        }
        _openai_grade_cache[cache_key] = result
        return result
    except Exception as exc:
        logger.warning("OpenAI grading fallback failed: %s", exc)
        return None


def score_answer(question_text, user_response, correct_answer, max_points):
    if not correct_answer:
        return 0.0, False, 0.0

    if openai_grading_available():
        openai_result = grade_with_openai(
            question_text=question_text,
            user_response=user_response,
            correct_answer=correct_answer,
            max_points=max_points,
        )
        if openai_result is not None:
            return (
                openai_result["similarity"],
                openai_result["is_correct"],
                openai_result["awarded_points"],
            )

    if is_multiple_choice_text(user_response) or is_multiple_choice_text(correct_answer):
        similarity, is_correct = score_choice_answer(user_response, correct_answer)
        return similarity, is_correct, max_points if is_correct else 0.0

    similarity = local_similarity_score(user_response, correct_answer)
    is_correct = similarity >= LOCAL_CORRECT_THRESHOLD
    return similarity, is_correct, max_points if is_correct else 0.0


def question_match_score(annotated_question, correct_question):
    separated_correct_question = separate_question_options(correct_question, logger=logger)
    if not separated_correct_question:
        return 0.0

    left = annotated_question or ""
    right = separated_correct_question["question"] or ""
    normalized_left = normalize_text(left)
    normalized_right = normalize_text(right)

    if not normalized_left or not normalized_right:
        return 0.0
    if normalized_left == normalized_right:
        return 1.0
    if normalized_left in normalized_right or normalized_right in normalized_left:
        return 0.95

    return max(
        local_similarity_score(left, right),
        token_overlap_score(left, right),
    )


def compare_responses(annotated, correct_answers):
    results = []

    for annotated_data in annotated:
        best_match = None
        best_match_score = 0.0

        for correct_data in correct_answers:
            current_score = question_match_score(
                annotated_data.get("question"),
                correct_data.get("question"),
            )
            if current_score > best_match_score:
                best_match_score = current_score
                best_match = correct_data

        if not best_match or best_match_score < QUESTION_MATCH_THRESHOLD:
            logger.info("No reliable question match found for annotation: %s", annotated_data)
            continue

        correct_answer = best_match.get("answer")
        user_response = annotated_data.get("response", "")
        rect = annotated_data["question_rect"]

        if correct_answer:
            similarity, is_correct, awarded_points = score_answer(
                question_text=best_match["question"],
                user_response=user_response,
                correct_answer=correct_answer,
                max_points=best_match["points"],
            )
            results.append(
                {
                    "question": best_match["question"],
                    "user_response": user_response,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct,
                    "similarity": similarity,
                    "points": awarded_points,
                    "question_rect": rect,
                }
            )
        else:
            results.append(
                {
                    "question": best_match["question"],
                    "user_response": user_response,
                    "correct_answer": None,
                    "is_correct": False,
                    "similarity": 0.0,
                    "points": 0,
                    "question_rect": rect,
                }
            )

    return results
