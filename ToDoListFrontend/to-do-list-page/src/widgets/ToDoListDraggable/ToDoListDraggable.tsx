import { ToDoListBasicItem, DraggableListItem } from "../../shared/components";
import { DragDropContext, Droppable, OnDragEndResponder } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, IconButton, List } from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";

export interface ToDoListDraggableProps<Item extends ToDoListBasicItem> {
     items: Item[]
     onDragEnd: OnDragEndResponder
     onClick: (index: number) => void
     onDelete: (index: number) => void
     onMark: (index: number) => void
     onAdd: () => void
     isEditable: boolean
}

export const ToDoListDraggable = <Item extends ToDoListBasicItem>({
    items,
    onDragEnd,
    onClick,
    onDelete,
    onMark,
    onAdd,
    isEditable,
}: ToDoListDraggableProps<Item>) => {
    return (
        <Card 
            sx={{
                width: '100%',
                height: '60vh',
                overflow: 'auto',
            }}
        >
            <CardHeader 
                title={'Список дел'}
                action={
                    isEditable ? <IconButton
                                    onClick={() => onAdd()}
                                >
                                    <AddCircleOutline />
                                </IconButton> 
                                : <></>
                }
                sx={{
                    padding: 3,
                    position: 'sticky',
                    backgroundColor: 'wheat',
                    zIndex: 1,
                    top: 0,
                }}
            />
            <CardContent sx={{padding: 0}} >
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable-list">
                        {
                            (provided) => (
                                <List ref={provided.innerRef} {...provided.droppableProps}>
                                    {
                                        items.map((item, index) => (
                                            <DraggableListItem 
                                                item={item}
                                                index={index}
                                                key={item.id}
                                                onClick={onClick}
                                                onDelete={onDelete}
                                                onMark={onMark}
                                                isEditable={isEditable}
                                            />
                                        ))
                                    }
                                </List>
                            )
                        }
                    </Droppable>
                </DragDropContext>
            </CardContent>
        </Card>
    );
}