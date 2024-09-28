export enum UserCRUDActions {
    UPDATE_ROLE = 'update_role',
    DELETE_USER = 'delete',
}


export enum Roles {
    ADMIN = 'admin',
    LIST_OWNER = 'list_owner',
}


export interface UserUpdateRoleActionData {
    new_role_name: Roles
}


export interface UsersListIncomingBackendItem {
    user_id: number
    user_name: string
    user_surname: string
    user_role_name: Roles
}

export interface UsersListFrontendItem {
    id: number
    name: string
    surname: string
    role: Roles
}


export interface UserCRUDOutgoingData {
    user_id: number
    action: UserCRUDActions
    action_data?: {
        new_role_name: Roles
    }
}

export interface IncomingBackendMessage {
    users_list: UsersListIncomingBackendItem[]
}