import { FC, useState } from "react"
import { DialogShell, DialogShellProps } from "../../../shared/components"
import { Button, TextField, Typography } from "@mui/material"

export interface CreateListItemDialogProps extends Omit<DialogShellProps, 'children' | 'title' | 'actions'> {
    onDataChange: (text: string) => void
}


export const CreateListItemDialog: FC<CreateListItemDialogProps> = ({
    open,
    onClose,
    onDataChange,
}) => {
    const [todoText, setTodoText] = useState<string>('');

    const onCreate = () => {
        onDataChange(todoText);
        onClose();
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const typedValue = event.target.value;

        setTodoText(typedValue);
    };

    return (
        <DialogShell
            open={open}
            onClose={onClose}
            title={
                <Typography>
                    Создать элемент списка дел
                </Typography>
            }
            actions={
                <>
                    <Button
                        onClick={() => onClose()}
                    >
                        Отмена
                    </Button>
                    <Button
                        disabled={!todoText}
                        onClick={() => onCreate()}
                    >
                        Создать
                    </Button>
                </>
            }
        >
            <TextField
                label='Описание'
                size='small'
                variant='outlined'
                fullWidth
                multiline
                rows={4}
                value={todoText}
                onChange={onChange}
                sx={{
                    marginTop: '10px',
                }}
            />
        </DialogShell>
    )
}