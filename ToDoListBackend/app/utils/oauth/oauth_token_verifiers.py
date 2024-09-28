import asyncio
from concurrent.futures import ThreadPoolExecutor
from google.oauth2 import id_token
from google.auth.transport import requests

from app import config

executor = ThreadPoolExecutor()

async def verify_google_token(token: str):
    loop = asyncio.get_event_loop()
    try:
        return await loop.run_in_executor(executor, id_token.verify_oauth2_token, token, requests.Request(), config.CLIENT_ID)
    except ValueError:
        return None
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None