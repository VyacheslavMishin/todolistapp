import { FC } from "react";
import { UsersListFrontendItem } from "../../../entities/user";
import { Box, Card, CardContent, CardHeader, List, ListItem, ListItemButton } from "@mui/material";
import { UpdateRoleSelector } from "../../../features/updateRole";
import { DeleteUserButton } from "../../../features/deleteUser";
import { redirectToUserList } from "../utils/redirectToUserList";

export interface UsersListProps {
    usersList: UsersListFrontendItem[],
    usersListWebSocketRef: React.RefObject<WebSocket | null>,
}

export const UsersList: FC<UsersListProps> = ({
    usersList,
    usersListWebSocketRef,
}) => {
    return (
        <Card
            sx={{
                width: '100%',
                height: '60vh',
                overflow: 'auto',
            }}
        >
            <CardHeader
                title='Список пользователей'
                sx={{
                    padding: 3,
                    position: 'sticky',
                    backgroundColor: 'wheat',
                    zIndex: 1,
                    top: 0,
                }}
            />
            <CardContent sx={{padding: 0}}>
                <List>
                    {
                        usersList.map((user) => (
                            <ListItem 
                                key={user.id}
                                secondaryAction={
                                    <Box
                                        display='flex'
                                        width='250px'
                                        height='max-content'
                                        justifyContent='space-between'
                                        alignItems='center'
                                    >
                                        <UpdateRoleSelector 
                                            listItem={user}
                                            usersListWebSocketRef={usersListWebSocketRef}
                                        />
                                        <DeleteUserButton 
                                            listItem={user}
                                            usersListWebSocketRef={usersListWebSocketRef}
                                        />
                                    </Box>
                                }
                            >
                                <ListItemButton
                                    onClick={() => redirectToUserList(user.id)}
                                >
                                    {
                                        `${user.name} ${user.surname}`
                                    }
                                </ListItemButton>
                            </ListItem>
                        ))
                    }
                </List>
            </CardContent>
        </Card>
    );
}