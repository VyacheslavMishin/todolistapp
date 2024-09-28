import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { FC, PropsWithChildren, ReactNode } from "react";

export interface DialogShellProps extends PropsWithChildren {
    open: boolean
    onClose: () => void
    title: ReactNode
    actions: ReactNode
}

export const DialogShell: FC<DialogShellProps> = ({
    open,
    onClose,
    title,
    actions,
    children,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}

        >
            <DialogTitle>
                {title}
            </DialogTitle>
            <DialogContent
                sx = {{
                    padding: 2,
                }}
            >
                {children}
            </DialogContent>
            <DialogActions>
                {actions}
            </DialogActions>
        </Dialog>
    );
}