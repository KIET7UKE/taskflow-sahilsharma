import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../slices/auth/authSlice";
import projectsReducer from "../slices/projects/projectsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  projects: projectsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
