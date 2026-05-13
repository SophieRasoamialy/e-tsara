import logging
import os

import fitz
from flask import Flask, jsonify, request

from .grading import build_cleaned_correct_answers, compare_responses
from .pdf_processing import (
    associate_responses_with_questions,
    extract_annotations,
    extract_text_and_annotations,
)

logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)

    @app.route("/analyze_qcm", methods=["POST"])
    def analyze_qcm():
        pdf_path = "/tmp/tempfile.pdf"
        doc = None

        try:
            pdf_file = request.files.get("pdf")
            if pdf_file is None or not pdf_file.filename:
                return jsonify({"error": "Missing pdf file"}), 400

            raw_correct_answers = request.form.get("correct_answers")
            if not raw_correct_answers:
                return jsonify({"error": "Missing correct_answers"}), 400

            try:
                import json

                correct_answers = json.loads(raw_correct_answers)
            except json.JSONDecodeError:
                return jsonify({"error": "Invalid correct_answers JSON"}), 400

            pdf_file.save(pdf_path)

            if not isinstance(correct_answers, list) or not correct_answers:
                return jsonify({"error": "Missing pdf_path or correct_answers"}), 400

            cleaned_correct_answers = build_cleaned_correct_answers(correct_answers)
            logger.info("cleaned_correct_answers:>>>>>>>>>>>> %s", cleaned_correct_answers)

            _, grouped_questions = extract_text_and_annotations(pdf_path)
            logger.info("grouped questions>>>>>> %s", grouped_questions)
            logger.info("")

            doc = fitz.open(pdf_path)
            page_annotations = extract_annotations(doc)
            logger.info("page annotations >>>>>>> %s", page_annotations)
            logger.info("")

            associated_responses = associate_responses_with_questions(grouped_questions, page_annotations)
            logger.info("associated_responses>>>>>>>>> %s", associated_responses)
            logger.info("")

            comparison_results = compare_responses(associated_responses, cleaned_correct_answers)
            logger.info("comparison_results: %s", comparison_results)

            return jsonify({"results": comparison_results})
        except Exception:
            logger.exception("Error during PDF analysis")
            return jsonify({"error": "Internal Server Error"}), 500
        finally:
            if doc is not None:
                doc.close()

            try:
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
            except OSError:
                logger.warning("Could not remove temporary PDF file: %s", pdf_path)

    return app
