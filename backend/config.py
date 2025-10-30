import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Email configuration
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASS = os.getenv('EMAIL_PASS')
SENDER_EMAIL = EMAIL_USER
SENDER_PASSWORD = EMAIL_PASS

# Default recipients for alerts
DEFAULT_RECIPIENTS = ['ssit82532@gmail.com', 'viharkdgowdackm@gmail.com']
