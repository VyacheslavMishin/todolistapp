from typing import List, Optional

from starlette.websockets import WebSocketDisconnect

from app.utils.ws_connections.websocket_with_user_data import WebSocketWithUserData


class WebSocketsListsManager:
    active_to_do_list_connections: List[WebSocketWithUserData] = []
    active_users_list_connections: List[WebSocketWithUserData] = []

    def __init__(
            self,
            active_to_do_list_connections: List[WebSocketWithUserData] = None,
            active_users_list_connections: List[WebSocketWithUserData] = None
    ):
        self.active_to_do_list_connections = active_to_do_list_connections or []
        self.active_users_list_connections = active_users_list_connections or []

    def add_to_do_list_connection(self, websocket: WebSocketWithUserData, user_id: Optional[int], user_role_name: Optional[str]):
        self.add_connection(websocket, self.active_to_do_list_connections, user_id, user_role_name)

    def add_users_list_connection(self, websocket: WebSocketWithUserData, user_id: Optional[int], user_role_name: Optional[str]):
        self.add_connection(websocket, self.active_users_list_connections, user_id, user_role_name)

    async def remove_to_do_list_connection_by_id(self, user_id: int):
        await self.remove_connection_by_id(user_id, self.active_to_do_list_connections)

    async def remove_users_list_connection_by_id(self, user_id: int):
        await self.remove_connection_by_id(user_id, self.active_users_list_connections)

    async def remove_to_do_list_connection(self, connection: WebSocketWithUserData):
        await self.remove_connection(connection, self.active_to_do_list_connections)

    async def remove_users_list_connection(self, connection: WebSocketWithUserData):
        await self.remove_connection(connection, self.active_users_list_connections)

    def update_role_to_do_list_connections(self, user_id: int, user_role_name: str):
        self.update_role(user_id, user_role_name, self.active_to_do_list_connections)

    def update_role_users_list_connections(self, user_id: int, user_role_name: str):
        self.update_role(user_id, user_role_name, self.active_users_list_connections)

    @staticmethod
    async def remove_connection_by_id(user_id: int, connections_list: List[WebSocketWithUserData]):

        for connection in connections_list:
            if connection.user_id == user_id:
                try:
                    await connection.close(code=1008)
                except WebSocketDisconnect:
                    continue

        connections_list[:] = [connection for connection in connections_list if connection.user_id != user_id]

    @staticmethod
    async def remove_connection(connection: WebSocketWithUserData, connections_list: List[WebSocketWithUserData]):
        try:
            await connection.close(code=1008)

        except WebSocketDisconnect:
            print(f'WS connection with user ID {connection.user_id} already closed')
        connections_list.remove(connection)

    @staticmethod
    def update_role(user_id: int, new_role_name: str, connections_list: List[WebSocketWithUserData]):
        for connection in connections_list:
            if connection.user_id == user_id:
                connection.user_role_name = new_role_name

    @staticmethod
    def add_connection(websocket: WebSocketWithUserData, list_to_update: List[WebSocketWithUserData],user_id: Optional[int], user_role_name: Optional[str]):
        if not (user_id is None):
            websocket.user_id = user_id
        if not (user_role_name is None):
            websocket.user_role_name = user_role_name

        list_to_update.append(websocket)
