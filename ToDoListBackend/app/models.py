from typing import List

from enum import Enum
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.future import select

import app.config as config


class ToDoListItem(BaseModel):
    title: str
    completed: bool

class UserCRUDActions(Enum):
    UPDATE_ROLE = 'update_role'
    DELETE_USER = 'delete'

class UserUpdateRoleActionData(BaseModel):
    new_role_name: str

class UserCRUDIncomingMessage(BaseModel):
    user_id: int
    action: UserCRUDActions
    action_data: UserUpdateRoleActionData

class UserCRUDOutgoingData(BaseModel):
    user_id: int
    user_name: str
    user_surname: str
    user_role_name: str

class UserCRUDOutgoingMessage(BaseModel):
    users_list: List[UserCRUDOutgoingData]


class UsersData(Base):
    __tablename__ = 'users_data'

    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String)
    user_surname = Column(String)
    user_role_id = Column(Integer, ForeignKey('roles_and_accesses.role_id'))
    user_oauth_id = Column(String, unique=True)
    user_to_do_list = Column(ARRAY(JSON))

    role = relationship('RolesAndAccesses', foreign_keys=[user_role_id], back_populates='users')

    def set_to_do_list(self, items: List[ToDoListItem]):
        self.user_to_do_list = [item.dict() for item in items]

    def get_to_do_list(self) -> List[ToDoListItem]:
        return [ToDoListItem(**item) for item in self.user_to_do_list]


class RolesAndAccesses(Base):
    __tablename__ = 'roles_and_accesses'

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String, unique=True)
    accesses = Column(JSON)

    users = relationship('UsersData', back_populates='role')


async def get_default_role(db_session: AsyncSession) -> RolesAndAccesses:
    result = await db_session.execute(
        select(RolesAndAccesses).where(RolesAndAccesses.role_name == config.DEFAULT_ROLE_NAME)
    )

    role = result.scalars().one_or_none()

    if role is None:
        raise ValueError('Default role not found')

    return role
