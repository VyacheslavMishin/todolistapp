import { DeleteOutline, EditOutlined } from "@mui/icons-material";
import { Checkbox, IconButton, ListItem, ListItemText } from "@mui/material";
import React, { useCallback } from "react";

import { Draggable } from 'react-beautiful-dnd';

export interface ToDoListBasicItem {
    id: string
    topText: string
    bottomText?: string
    done: boolean
}

export interface DraggableListItemProps<Item extends ToDoListBasicItem> {
    onClick: (index: number) => void
    onDelete: (index: number) => void
    onMark: (index: number) => void
    index: number
    item: Item
    isEditable: boolean
}

export const DraggableListItem = <Item extends ToDoListBasicItem>({
    onClick,
    onDelete,
    onMark,
    item,
    index,
    isEditable,
}: DraggableListItemProps<Item>) => {

    const onItemClick = useCallback((event: React.MouseEvent, index: number) => {
      event.stopPropagation();
      onClick(index);
    },  [onClick]);

    const onItemDelete = useCallback((event: React.MouseEvent, index: number) => {
      event.stopPropagation();
      onDelete(index);
    }, [onDelete]);

    const onMarkChange = (index: number) => {
      if(isEditable) {
        onMark(index);
      }
    }

    return <Draggable draggableId={item.id} index={index}>
    {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={snapshot.isDragging ? { background: 'rgb(235,235,235)' } : {}}
        >
          <Checkbox
            checked={item.done}
            onChange={() => onMarkChange(index)}
          />
          <ListItemText primary={item.topText} secondary={item.bottomText} />
          {
            isEditable && (
              <>
                <IconButton
                  onClick={(event) => onItemClick(event, index)}
                >
                  <EditOutlined />
                </IconButton>
                <IconButton
                  onClick={(event) => onItemDelete(event, index)}
                >
                  <DeleteOutline />
                </IconButton>
              </>
            )
          }
        </ListItem>
    )}
  </Draggable>
}