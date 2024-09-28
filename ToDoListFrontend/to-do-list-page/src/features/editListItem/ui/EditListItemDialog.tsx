import { FC, useState } from "react";
import { DialogShell, DialogShellProps } from "../../../shared/components";
import { Button, TextField } from "@mui/material";


export interface EditListItemDialogProps extends Omit<DialogShellProps, 'children' | 'title' | 'actions'> {
    initialText: string
    index: number
    onDataChange: (text: string, index: number) => void
}


export const EditListItemDialog: FC<EditListItemDialogProps> = ({
    open,
    onClose,
    onDataChange,
    initialText,
    index,
}) => {
    const [todoText, setTodoText] = useState<string>(initialText);

    const onSave = () => {
        onDataChange(todoText, index);
        onClose();
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const typedValue = event.target.value;

        setTodoText(typedValue);
    };

    return (
        <DialogShell
            open={open}
            onClose={() => onClose()}
            title='Редактировать элемент списка дел'
            actions={
                <>
                    <Button
                        onClick={() => onClose()}
                    >
                        Отмена
                    </Button>
                    <Button
                        disabled={!todoText}
                        onClick={() => onSave()}
                    >
                        Сохранить
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
    );
}