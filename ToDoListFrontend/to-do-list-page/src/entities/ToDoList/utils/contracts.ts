import { generateRandomString } from "../../../shared/utils"

export interface BackendToDoListItem {
    title: string
    completed: boolean
}

export interface BackendToDoListIncomingMessage {
    to_do_list: BackendToDoListItem[],
    is_editable: boolean,
}

export interface ToDoListFrontendItem {
    id: string
    topText: string
    bottomText?: string
    done: boolean
}

export interface ToDoListData {
    toDoList: ToDoListFrontendItem[]
    isEditable: boolean
}


const todoItemBack2Front = (item: BackendToDoListItem): ToDoListFrontendItem => ({
    id: generateRandomString(10),
    done: item.completed,
    topText: item.title,
});


const todoItemFront2Back = (item: ToDoListFrontendItem): BackendToDoListItem => ({
    completed: item.done,
    title: item.topText,
});

export const toDoListBack2Front = (backendMessage: string): ToDoListData => {
    const parsedBackendMessage = JSON.parse(backendMessage) as BackendToDoListIncomingMessage;

    return {
        isEditable: !!parsedBackendMessage?.is_editable,
        toDoList: parsedBackendMessage.to_do_list.map(todoItemBack2Front),
    }
};


export const toDoListFront2Back = (list: ToDoListFrontendItem[], userId: number): string => {
    return JSON.stringify({to_do_list: list.map(todoItemFront2Back), user_id: userId});
}