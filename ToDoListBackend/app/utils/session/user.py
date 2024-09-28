from starlette.requests import Request

from app.models import UsersData
from app.utils.consts import session_keys


def memorize_user_session_data(request: Request, user: UsersData):
    if user:
        request.session[session_keys.USER] = {
            'user_id': user.user_id,
            'user_name': user.user_name,
            'user_surname': user.user_surname,
            'user_role_id': user.user_role_id,
        }
    else:
        raise ValueError('UserData must be filled!')


def remove_user_session_data(request: Request):
    if session_keys.USER in request.session:
        request.session.clear()

def get_user_session_data(request: Request):
    return request.session.get(session_keys.USER)