import { Grid2 } from "@mui/material";
import { FC, PropsWithChildren, ReactNode } from "react";

export interface PageLayoutProps extends PropsWithChildren {
    header: ReactNode
}

export const PageLayout: FC<PageLayoutProps> = ({
    children,
    header,
}) => {
    return (
        <Grid2
            container
            columns={16}
            boxSizing='border-box'
            width='100%'
            height='100%'
        >
            <Grid2
                size={16}
                height='55px'
            >
                {header}
            </Grid2>
            <Grid2
                height='calc(100% - 55px)'
                size={16}
                style={{
                    overflow: 'auto',
                }}
            >
                {children}
            </Grid2>
        </Grid2>
    );
};