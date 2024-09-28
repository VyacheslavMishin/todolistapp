import { Box, Typography } from "@mui/material"
import { LogoutHeaderButton } from "../../features/logout";


export const Header = () => {
    return (
        <Box
            sx={{
                position: 'relative',
                height: '100%',
                width: '100%',
                borderBottom: '1px solid black',
                padding: '16px 2em',
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