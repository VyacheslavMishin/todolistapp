import os
from typing import List, Annotated

from fastapi import FastAPI, Cookie, WebSocketException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.params import Depends
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request
from starlette.responses import RedirectResponse, HTMLResponse
from authlib.integrations.starlette_client import OAuth, OAuthError
from starlette.websockets import WebSocket, WebSocketDisconnect, WebSocketState

import app.utils.consts.session_keys as session_keys
import app.config as config
import app.utils.consts.routes as routes_names
from app.database import SessionLocal
from app.models import UsersData, get_default_role, ToDoListItem, UserCRUDIncomingMessage, UserCRUDActions, \
    UserCRUDOutgoingMessage, UserCRUDOutgoingData, RolesAndAccesses
from app.utils.db_session.user_operations import get_user_data_from_db, add_new_user, get_user_role
from app.utils.oauth.oauth_token_handlers import google_oauth_token_handler
from app.utils.oauth.oauth_token_verifiers import verify_google_token
from app.utils.session.user import memorize_user_session_data, get_user_session_data
from app.utils.ws_connections.websocket_with_user_data import WebSocketWithUserData
from app.utils.ws_connections.websockets_lists_manager import WebSocketsListsManager

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ToDoListFrontend'))


app = FastAPI()


app.mount(routes_names.LOGIN, StaticFiles(directory=os.path.join(frontend_dir, 'login-page/dist')), name='login-page')
app.mount(routes_names.USER_TODO_LIST, StaticFiles(directory=os.path.join(frontend_dir, 'to-do-list-page/dist')), name='to-do-list-page')
app.mount('/to-do-list/assets', StaticFiles(directory=os.path.join(frontend_dir, 'to-do-list-page/dist/assets')), name='assets')
app.mount(routes_names.USERS_LIST, StaticFiles(directory=os.path.join(frontend_dir, 'users-list-page/dist')), name='users-list')


app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:8000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

app.add_middleware(SessionMiddleware, secret_key='add any string...')

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:8000;"
    return response


websockets_lists_manager = WebSocketsListsManager()

oauth = OAuth()
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_id=config.CLIENT_ID,
    client_secret=config.CLIENT_SECRET,
    client_kwargs={
        'scope': 'email openid profile',
        'redirect_url': 'http://localhost:8000/auth'
    }
)

async def get_auth_token(
    websocket: WebSocketWithUserData,
    auth_token: Annotated[str | None, Cookie()] = None,
):
    if auth_token is None:
        raise WebSocketException(code=1008)
    return auth_token


@app.get(routes_names.ROOT_PAGE)
def index(request: Request):
    user = request.session.get(session_keys.USER)
    if user:
        return RedirectResponse(routes_names.USER_TODO_LIST)  # перенаправление должно основываться на ролях

    return {'Hello': 'World'}


@app.get(routes_names.LOGIN)
def login(request: Request):
    return HTMLResponse(content=open(os.path.join(frontend_dir, 'login-page/dist/index.html')).read())

@app.get(routes_names.LOGIN_GOOGLE)
async def login_google(request: Request):
    url = request.url_for('auth')
    return await oauth.google.authorize_redirect(request, url)

@app.get(routes_names.AUTH)
async def auth(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as e:
        return {'message': 'something went wrong'}

    try:
        user_info = google_oauth_token_handler(token)
    except ValueError as e:
        return {'message': 'User info is not available'}

    async with SessionLocal() as db:
        try:
            user = await get_user_data_from_db(db, user_info)

            if not user:
                role = await get_default_role(db)

                user_info['user_role_id'] = role.role_id
                user_info['user_to_do_list'] = []

                await add_new_user(db, UsersData(**user_info))

                user = await get_user_data_from_db(db, user_info)

                memorize_user_session_data(request, user)

                response = RedirectResponse(routes_names.USER_TODO_LIST)

                response.set_cookie(key='auth_token', value=token['id_token'], httponly=True)

                await notify_admins_of_users_list_update()

                return response

            user_role = await get_user_role(db, user)

            memorize_user_session_data(request, user)

            if user_role.role_name == config.LIST_OWNER_ROLE_NAME:
                response = RedirectResponse(routes_names.USER_TODO_LIST.replace('{user_id}', str(user.user_id)))
                response.set_cookie(key='auth_token', value=token['id_token'], httponly=True)
                return response

            if user_role.role_name == config.ADMIN_ROLE_NAME:
                response = RedirectResponse(routes_names.USERS_LIST)
                response.set_cookie(key='auth_token', value=token['id_token'], httponly=True)
                return response

        except Exception as e:
            print('ERROR', e)
            return {'message': f'Error during database operation: {str(e)}'}


@app.get(routes_names.USER_TODO_LIST)
def user_to_do_list(request: Request, user_id: int):
    user = get_user_session_data(request)
    if not user:
        return RedirectResponse(routes_names.ROOT_PAGE)

    return HTMLResponse(content=open(os.path.join(frontend_dir, 'to-do-list-page/dist/index.html')).read())


'''
!!! ВНИМАНИЕ !!!

К некоторым ресурсам требуется ограничить доступ

В частности, список пользователей доступен только администратору!

'''
@app.get(routes_names.USERS_LIST)
def users_list(request: Request):
    return HTMLResponse(content=open(os.path.join(frontend_dir, 'users-list-page/dist/index.html')).read())


@app.get(routes_names.LOGOUT)
def logout(request: Request):
    if session_keys.USER in request.session:
        request.session.clear()
    return RedirectResponse(routes_names.LOGIN)


@app.websocket('/ws/update_to_do/{user_id}')
async def websocket_todo(
        websocket: WebSocketWithUserData,
        user_id: int,
        auth_token: Annotated[str, Depends(get_auth_token)]
):
    await websocket.accept()

    is_editable = False

    user_id_authorized, user_role_name_authorized = None, None


    if auth_token:

       user_data = await verify_google_token(auth_token)

       if not user_data:
           await websocket.close(code=1008)
           return RedirectResponse(routes_names.LOGOUT)

       async with SessionLocal() as db:

           user = await get_user_data_from_db(db, {'user_oauth_id': user_data['sub']})
           user_role = await get_user_role(db, user)

           is_editable = (user.user_id == user_id and user_role.role_name == config.LIST_OWNER_ROLE_NAME) or user_role.role_name == config.ADMIN_ROLE_NAME

           user_id_authorized = user.user_id
           user_role_name_authorized = user_role.role_name

    websockets_lists_manager.add_to_do_list_connection(websocket, user_id_authorized, user_role_name_authorized)


    try:

        async with SessionLocal() as db:
            user = await db.execute(select(UsersData).where(UsersData.user_id == user_id))
            if not user:
                await websocket.send_json({'message': f'No user with ID {user_id}'})
                return

            user = user.scalars().one()
            to_do_list = user.get_to_do_list()
            await websocket.send_json({'to_do_list': [item.dict() for item in to_do_list], 'is_editable': is_editable})

        while True:
            message = await websocket.receive_json()

            if auth_token:

                user_data = await verify_google_token(auth_token)

                if not user_data:
                    await websocket.close(code=1008)
                    await websockets_lists_manager.remove_to_do_list_connection(user_id_authorized)
                    return

                async with SessionLocal() as db:
                    user = await get_user_data_from_db(db, {'user_oauth_id': user_data['sub']})

                    if user:
                        if is_editable:
                            incoming_to_do_list = message.get('to_do_list', [])
                            todo_items = [ToDoListItem(**item) for item in incoming_to_do_list]
                            await update_user_todo_list(db, user.user_id, todo_items)
                            await db.commit()

                for connection in websockets_lists_manager.active_to_do_list_connections:
                    if connection.client_state == WebSocketState.CONNECTED:
                        await connection.send_json({
                            'to_do_list': incoming_to_do_list,
                            'is_editable': (connection.user_id == user_id and connection.user_role_name == config.LIST_OWNER_ROLE_NAME) or connection.user_role_name == config.ADMIN_ROLE_NAME
                        })

    except WebSocketDisconnect:
        await websockets_lists_manager.remove_to_do_list_connection(websocket)


@app.websocket('/ws/users-list')
async def websocket_users_list(
        websocket: WebSocketWithUserData,
        auth_token: Annotated[str, Depends(get_auth_token)]
):
    await websocket.accept()

    user_role_name_authorized, user_id_authorized = None, None

    if not auth_token:
        await websocket.close(code=1008)
        return RedirectResponse(routes_names.LOGIN)

    user_data = await verify_google_token(auth_token)
    
    if not user_data:
        await websocket.close(code=1008)
        return RedirectResponse(routes_names.LOGIN)
    
    async with SessionLocal() as db:
        user = await get_user_data_from_db(db, {'user_oauth_id': user_data['sub']})
        
        if not user:
            await websocket.close(code=1008)
            return RedirectResponse(routes_names.LOGIN)

        user_role_name_authorized = user.role.role_name
        user_id_authorized = user.user_id
        
        if user_role_name_authorized != config.ADMIN_ROLE_NAME:
            await websocket.close(code=1008)
            return RedirectResponse(routes_names.LOGIN)



    websockets_lists_manager.add_users_list_connection(websocket, user_id_authorized, user_role_name_authorized)

    await send_list_first_time(websocket)

    try:
        while True:
            try:
                raw_message = await websocket.receive_json()
                message = UserCRUDIncomingMessage(**raw_message)
            except ValidationError:
                print('Incorrect data was received', raw_message)
                continue

            if message.action == UserCRUDActions.DELETE_USER:
                async with SessionLocal() as db:
                    user_id = message.user_id
                    user_to_delete = await db.execute(select(UsersData).filter(UsersData.user_id == user_id))
                    user_to_delete = user_to_delete.scalars().one_or_none()

                    if not user_to_delete:
                        continue

                    await db.delete(user_to_delete)
                    await db.commit()


                    await websockets_lists_manager.remove_users_list_connection_by_id(user_id)
                    await websockets_lists_manager.remove_to_do_list_connection_by_id(user_id)



            if message.action == UserCRUDActions.UPDATE_ROLE:
                if message.action_data:
                    user_id = message.user_id
                    new_role_name = message.action_data.new_role_name

                    async with SessionLocal() as db:
                        role_record = await db.execute(select(RolesAndAccesses).where(RolesAndAccesses.role_name == new_role_name))
                        role = role_record.scalars().one_or_none()

                        if not role:
                            print('Wrong new role name')
                            continue

                        user_to_update_role_id = await db.execute(select(UsersData).where(UsersData.user_id == user_id))
                        user_to_update_role_id = user_to_update_role_id.scalars().one_or_none()

                        if not user_to_update_role_id:
                            print('No user found to update role')
                            continue

                        user_to_update_role_id.user_role_id = role.role_id

                        await db.commit()


                    if new_role_name == config.LIST_OWNER_ROLE_NAME:

                        await websockets_lists_manager.remove_users_list_connection_by_id(user_id)
                        websockets_lists_manager.update_role_to_do_list_connections(user_id, new_role_name)

                    if new_role_name == config.ADMIN_ROLE_NAME:
                        websockets_lists_manager.update_role_to_do_list_connections(user_id, new_role_name)

            await notify_admins_of_users_list_update()




    except WebSocketDisconnect:
        await websockets_lists_manager.remove_to_do_list_connection(websocket)


async def update_user_todo_list(db: AsyncSession, user_id: int, new_todo_list: List[ToDoListItem]):

    result = await db.execute(select(UsersData).where(UsersData.user_id == user_id))
    user = result.scalars().one_or_none()

    if user is None:
        raise ValueError('User not found')

    user.set_to_do_list(new_todo_list)

    await db.commit()


async def send_list_first_time(connection: WebSocketWithUserData):
    async with SessionLocal() as db:

        remaining_users = await db.execute(select(UsersData).options(selectinload(UsersData.role)))
        remaining_users_list = remaining_users.scalars().all()

        outgoing_users_list_message = UserCRUDOutgoingMessage(
            users_list=[
                UserCRUDOutgoingData(
                    user_id=user.user_id,
                    user_name=user.user_name,
                    user_surname=user.user_surname,
                    user_role_name=user.role.role_name
                ) for user in remaining_users_list
            ]
        )

    await connection.send_json(outgoing_users_list_message.dict())

async def notify_admins_of_users_list_update():
    async with SessionLocal() as db:

        remaining_users = await db.execute(select(UsersData).options(selectinload(UsersData.role)))
        remaining_users_list = remaining_users.scalars().all()

        outgoing_users_list_message = UserCRUDOutgoingMessage(
            users_list=[
                UserCRUDOutgoingData(
                    user_id=user.user_id,
                    user_name=user.user_name,
                    user_surname=user.user_surname,
                    user_role_name=user.role.role_name
                ) for user in remaining_users_list
            ]
        )

    for connection in websockets_lists_manager.active_users_list_connections:
        await connection.send_json(outgoing_users_list_message.dict())