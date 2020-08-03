import {createStore, applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk";
import {} from "./actionConstants";

const INITIAL_STATE = {

}

const rootReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        default:
            return state;
    }
}

export default createStore(rootReducer, applyMiddleware(thunkMiddleware));