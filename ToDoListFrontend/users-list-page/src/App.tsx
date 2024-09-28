import { useEffect, useRef, useState } from 'react'
import './App.scss'
import { PageLayout } from './shared/ui'
import { Header } from './widgets/Header'
import { usersListBack2Front, UsersListFrontendItem } from './entities/user'
import { UsersList } from './widgets/UsersList/ui/UsersList'
import { Box } from '@mui/material'



function App() {

  const [usersList, setUsersList] = useState<UsersListFrontendItem[]>([]);

  const usersListWebSocketRef = useRef<WebSocket | null>(null);


  useEffect(() => {
    const wsInstance = new WebSocket('ws://localhost:8000/ws/users-list');


    wsInstance.onmessage = (message:  {data: string}) => {
      setUsersList(usersListBack2Front(message.data));
    };
    
    usersListWebSocketRef.current = wsInstance;

    return () => wsInstance.close();
  },  []);


  return (
    <PageLayout
      header={<Header />}
    >
      <Box
        width='100%'
        height='100%'
        padding='2em'
        display='flex'
        justifyContent='center'
        alignItems='center'
      >
        <UsersList 
          usersList={usersList}
          usersListWebSocketRef={usersListWebSocketRef}
        />
      </Box>
    </PageLayout>
  )
}

export default App
