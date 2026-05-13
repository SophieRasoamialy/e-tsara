import logging

from qcm_service import create_app

logging.basicConfig(level=logging.INFO)

app = create_app()
