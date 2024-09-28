import { Box, Typography } from "@mui/material"
import { LogoutHeaderButton } from "../../features/logout";


export const Header = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '55px',
                borderBottom: '1px solid black',
                padding: '16px 2em',
                zIndex: 2,
                background: 'wheat',
            }}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            flexDirection='row'
        >
            <Typography
                variant="h6"
            >
                Real-Time TODO
            </Typography>
            <LogoutHeaderButton />
        </Box>
    );
}