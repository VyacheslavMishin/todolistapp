import { MenuItem, TextField } from "@mui/material";
import { ChangeEvent, FC, MouseEvent } from "react";
import { formUsersListCRUDAction, Roles, UserCRUDActions, UsersListFrontendItem } from "../../../entities/user";
import { displayedRoles } from "../utils";


export interface UpdateRoleSelectorProps {
    listItem: UsersListFrontendItem
    usersListWebSocketRef: React.RefObject<WebSocket | null>
}


export const UpdateRoleSelector: FC<UpdateRoleSelectorProps> = ({
    listItem,
    usersListWebSocketRef,
}) => {


    const onClickHandler = (event: MouseEvent) => {
        event.stopPropagation();
    }

    const onChangeHandler = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        
        const selectedValue = event.target.value as Roles;

        const wsInstance = usersListWebSocketRef.current;

        if(!wsInstance) return;

        const stringifiedAction = formUsersListCRUDAction(
            UserCRUDActions.UPDATE_ROLE,
            listItem,
            selectedValue,
        );

        wsInstance.send(stringifiedAction);

    }


    return (
        <TextField
            select
            fullWidth
            size='small'
            variant='outlined'
            defaultValue={listItem.role}
            onClick={onClickHandler}
            onChange={onChangeHandler}
        >
            <MenuItem value={Roles.ADMIN}>
              {displayedRoles[Roles.ADMIN]}
            </MenuItem>
            <MenuItem value={Roles.LIST_OWNER}>
              {displayedRoles[Roles.LIST_OWNER]}
            </MenuItem>
        </TextField>
    );
};