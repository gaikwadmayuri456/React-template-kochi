import { combineReducers } from "redux";
import authReducer from "./AuthReducer";
import FaultDataReducer from "../Reducers/FaultDataReducer"



const combinedReducer = combineReducers({
    authReducer,FaultDataReducer
})

export default combinedReducer;