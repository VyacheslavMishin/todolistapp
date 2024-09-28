import { LogoutRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { logoutClickHandler } from "../utils";


export const LogoutHeaderButton = () => {
    return (
        <Button
            startIcon={<LogoutRounded />}
            onClick={() => logoutClickHandler()}
        >
            Выйти
        </Button>
    );
}