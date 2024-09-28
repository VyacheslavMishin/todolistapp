import { useEffect, useMemo, useRef, useState } from 'react';
import './App.scss';
import { ToDoListBasicItem } from './shared/components';
import { Header, ToDoListDraggable } from './widgets';
import { DropResult } from 'react-beautiful-dnd';
import { generateRandomString, reorder } from './shared/utils';
import { CreateListItemDialog } from './features/createListItem';
import { EditListItemDialog } from './features/editListItem';
import { toDoListBack2Front, toDoListFront2Back } from './entities/ToDoList';

/* const mockedItems: ToDoListBasicItem[] = [
  {
    id: 'asdasdfasdf',
    done: true,
    topText: 'asfhasdjkfhasd',
  },
  {
    id: 'sldhbsdf',
    done: false,
    topText: 'lsdjkhsd',
  },
  {
    id: 'asd',
    done: true,
    topText: 'asfhasd',
  },
  {
    id: 'dfasdf',
    done: false,
    topText: 'asdjkfhasd',
  },
  {
    id: 'asdaf',
    done: false,
    topText: 'asfhjkfhasd',
  },
]; */

enum DialogKinds {
  CREATE_TODO_LIST_ITEM= 'create_todo_list_item',
  UPDATE_TODO_LIST_ITEM= 'update_todo_list_item',
  NONE='',
}

function App() {

  const userId = useMemo(() => {
    return +(window.location.pathname.match(/\d+/) || '') || -1
  }, []);

  const listUpdateWSRef = useRef<WebSocket | null>(null);

  const [listState, setListState] = useState<ToDoListBasicItem[]>([]);
  const [dialogKind, setDialogKind] = useState<DialogKinds>(DialogKinds.NONE);
  const [clickedListItemIndex, setClickedListItemIndex] = useState<number>(-1);
  const [isEditable, setIsEditable] = useState<boolean>(false);


  const closeDialog = () => setDialogKind(DialogKinds.NONE);

  const onAdd = () => setDialogKind(DialogKinds.CREATE_TODO_LIST_ITEM);

  const onNewItemCreated = (itemText: string) => {

    if(!itemText) return;

    setListState(prevState => {
      const newList = [
        ...prevState,
        {
          id: generateRandomString(10),
          done: false,
          topText: itemText,
        }
      ];

      listUpdateWSRef.current!.send(toDoListFront2Back(newList, userId))

      return newList;

    });

  };

  const onElementUpdate = (itemText: string, index: number) => {
    
    if(!itemText) return;

    setListState(prevState => {
      const itemToUpdate = {...prevState[index]}

      itemToUpdate.topText = itemText;

      prevState[index] = itemToUpdate;

      const newList = [...prevState];

      listUpdateWSRef.current!.send(toDoListFront2Back(newList, userId))
      return newList;

    })
  };

  const onMark = (index: number) => {
    setListState(prevState => {
      const newList = prevState.map((item, i) => 
        i === index ? { ...item, done: !item.done } : item
      );
      listUpdateWSRef.current!.send(toDoListFront2Back(newList, userId))
      return newList;
    });
  };

  const onDelete = (index: number) => {
    const newList = [...listState];
    newList.splice(index, 1);
    setListState(newList);
    listUpdateWSRef.current!.send(toDoListFront2Back(newList, userId))
  };

  const onClick = (index: number) => {
    setClickedListItemIndex(index);
    setDialogKind(DialogKinds.UPDATE_TODO_LIST_ITEM);
  };

  const onDragEnd = ({ destination, source }: DropResult) => {
    if (!destination) return;

    const newItems = reorder(listState, source.index, destination.index);
    setListState(newItems);

    listUpdateWSRef.current!.send(toDoListFront2Back(newItems, userId))
  };

  const initialText = listState[clickedListItemIndex]?.topText || '';


  useEffect(() => {

    if(userId > 0) {
      
      listUpdateWSRef.current = new WebSocket(`ws://localhost:8000/ws/update_to_do/${userId}`);
      
      listUpdateWSRef.current.onmessage = ((message: { data: string; }) => {
        const parsedData = toDoListBack2Front(message.data);
        setListState(parsedData.toDoList);
        setIsEditable(parsedData.isEditable);
      });

      return () => {
        listUpdateWSRef.current!.close();
      }

    }

  },  [userId])

  return (
    <>
      <Header />
      <ToDoListDraggable
        items={listState}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onDelete={onDelete}
        onMark={onMark}
        onAdd={onAdd}
        isEditable={isEditable}
      />
      {
        dialogKind === DialogKinds.CREATE_TODO_LIST_ITEM && (
          <CreateListItemDialog 
            open={dialogKind === DialogKinds.CREATE_TODO_LIST_ITEM}
            onClose={closeDialog}
            onDataChange={onNewItemCreated}
          />
        )
      }
      {
        dialogKind === DialogKinds.UPDATE_TODO_LIST_ITEM && (
          <EditListItemDialog 
            open={dialogKind === DialogKinds.UPDATE_TODO_LIST_ITEM}
            onClose={closeDialog}
            index={clickedListItemIndex}
            initialText={initialText}
            onDataChange={onElementUpdate}
          />
        )
      }
    </>
  );
}

export default App;