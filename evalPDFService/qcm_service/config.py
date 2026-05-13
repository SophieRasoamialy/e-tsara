from pathlib import Path
import os
import re

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4-mini")
OPENAI_TIMEOUT_SECONDS = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "20"))
OPENAI_GRADING_ENABLED = os.getenv("OPENAI_GRADING_ENABLED", "true").lower() != "false"
LOCAL_CORRECT_THRESHOLD = float(os.getenv("LOCAL_CORRECT_THRESHOLD", "0.72"))
QUESTION_MATCH_THRESHOLD = float(os.getenv("QUESTION_MATCH_THRESHOLD", "0.45"))
OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"

QUESTION_START_PATTERN = re.compile(r"^(\d+\.|\d+\)|[➊➋➌➍➎➏➐➑➒])")
OPTION_PATTERN = re.compile(r"([A-Da-d]\)|❍[a-d]\.|[A-Da-d]\.)")
QUESTION_OPTION_PATTERN = re.compile(r"[❍◯❑⬜]\s?[a-d]\.\s?[^\n]+")
QUESTION_OPTION_SPLIT_PATTERN = re.compile(r"[❍◯❑⬜]\s?[a-d]\.")
MANUAL_CHECK_SYMBOLS = ["x", "X", "✓"]
STOP_SYMBOLS = ["❍", "◯", "❑", "⬜"]

MANUAL_LINE_PADDING = 5
CAPTURE_INCREMENT = 30
MAX_CAPTURE_WIDTH = 500
MAX_QUESTION_DISTANCE = 100
