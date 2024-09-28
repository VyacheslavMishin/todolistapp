from typing import Any

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import SessionLocal
from app.models import UsersData, RolesAndAccesses


async def get_user_data_from_db(db: SessionLocal, user_info: dict[str, Any]) -> UsersData:
    user = await db.execute(
        select(UsersData).options(selectinload(UsersData.role)).where(UsersData.user_oauth_id == user_info['user_oauth_id'])
    )
    return user.scalars().one_or_none()


async def add_new_user(db: SessionLocal, users_data: UsersData):
    db.add(users_data)
    await db.commit()

async def get_user_role(db: SessionLocal, user: UsersData):
    user_role = await db.execute(
        select(RolesAndAccesses).where(RolesAndAccesses.role_id == user.user_role_id)
    )
    return user_role.scalars().one()