import { IncomingBackendMessage, Roles, UserCRUDActions, UserCRUDOutgoingData, UsersListFrontendItem, UsersListIncomingBackendItem } from "../models"



const usersListItemBack2Front = (item: UsersListIncomingBackendItem): UsersListFrontendItem => {
    return {
        id: item.user_id,
        name: item.user_name,
        surname: item.user_surname,
        role: item.user_role_name
    }
};


export const usersListBack2Front = (messageJson: string): UsersListFrontendItem[] => {
    const parsedMessage = JSON.parse(messageJson) as IncomingBackendMessage;

    return parsedMessage.users_list.map(usersListItemBack2Front)
};

export const formUsersListCRUDAction = (action: UserCRUDActions , item: UsersListFrontendItem, newRole?: Roles): string  => {
    const dataToReturn: UserCRUDOutgoingData = {
        action,
        user_id: item.id,
    }

    if(action === UserCRUDActions.UPDATE_ROLE && newRole) {
        dataToReturn.action_data = {
            new_role_name: newRole,
        };
    }
    
    return JSON.stringify(dataToReturn)
}