from starlette.websockets import WebSocket


class WebSocketWithUserData(WebSocket):
    user_id: int = None
    user_role_name: str = None

    def __init__(self, *args, user_id: int = None, user_role_name: str = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_id = user_id
        self.user_role_name = user_role_name