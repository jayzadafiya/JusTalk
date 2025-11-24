import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Task, List, Board } from "@types";

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  tasks: Task[];
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  lists: [],
  tasks: [],
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload;
    },
    setCurrentBoard: (state, action: PayloadAction<Board | null>) => {
      state.currentBoard = action.payload;
    },
    setLists: (state, action: PayloadAction<List[]>) => {
      state.lists = action.payload;
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload);
    },
    addList: (state, action: PayloadAction<List>) => {
      state.lists.push(action.payload);
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateBoard: (state, action: PayloadAction<Board>) => {
      const index = state.boards.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.boards[index] = action.payload;
      }
    },
    updateList: (state, action: PayloadAction<List>) => {
      const index = state.lists.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.lists[index] = action.payload;
      }
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteBoard: (state, action: PayloadAction<string>) => {
      state.boards = state.boards.filter((b) => b.id !== action.payload);
    },
    deleteList: (state, action: PayloadAction<string>) => {
      state.lists = state.lists.filter((l) => l.id !== action.payload);
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    moveTask: (
      state,
      action: PayloadAction<{ taskId: string; newListId: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.listId = action.payload.newListId;
      }
    },
  },
});

export const {
  setBoards,
  setCurrentBoard,
  setLists,
  setTasks,
  addBoard,
  addList,
  addTask,
  updateBoard,
  updateList,
  updateTask,
  deleteBoard,
  deleteList,
  deleteTask,
  moveTask,
} = boardSlice.actions;

export default boardSlice.reducer;
