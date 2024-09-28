import { FC, MouseEvent } from "react"
import { DeleteOutline } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { formUsersListCRUDAction, UserCRUDActions, UsersListFrontendItem } from "../../../entities/user"

export interface DeleteUserButtonProps {
    listItem: UsersListFrontendItem
    usersListWebSocketRef: React.RefObject<WebSocket | null>
}

export const DeleteUserButton: FC<DeleteUserButtonProps> = ({
    usersListWebSocketRef,
    listItem,
}) => {

    const onClickHandler = (event: MouseEvent) => {

        event.stopPropagation();
        
        const wsInstance = usersListWebSocketRef.current;

        if (!wsInstance) {
            return;
        }

        const stringifiedAction = formUsersListCRUDAction(
            UserCRUDActions.DELETE_USER,
            listItem,
        );

        wsInstance.send(stringifiedAction);
    }
    return (
        <IconButton
            onClick={onClickHandler}
        >
            <DeleteOutline />
        </IconButton>
    )
}