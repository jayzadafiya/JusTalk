import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import boardReducer from "./slices/boardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Date objects
        ignoredActions: ["board/setTasks", "board/addTask", "board/updateTask"],
        ignoredPaths: ["board.tasks", "board.lists", "board.boards"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
