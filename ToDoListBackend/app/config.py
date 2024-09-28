import os
from dotenv import load_dotenv

load_dotenv()


get_env_var = lambda var_name: os.environ.get(var_name, None)

CLIENT_ID = get_env_var('client-id')
CLIENT_SECRET = get_env_var('client-secret')

SQLALCHEMY_DATABASE_URL = get_env_var('database-url')

DEFAULT_ROLE_NAME = get_env_var('default-role-name')

DEFAULT_ROLE_ID = int(get_env_var('default-role-id'))

LIST_OWNER_ROLE_NAME = get_env_var('list-owner-role-name')

ADMIN_ROLE_NAME = get_env_var('admin-role-name')

