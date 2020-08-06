import {createStore, applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk";
import { NEW_MESSAGE, CONNECTED, START_GAME_SUCCESS, INVALID_USERNAME } from "./actionConstants";


export const LOGIN_STATE = {
    LOGGED_IN: "logged in",
    LOGGED_OUT: "logged out",
    INVALID_LOGIN: "invalid login",
    NETWORK_ERROR: "network error"
}

const INITIAL_STATE = {
    isConnected: false,
    loginState: LOGIN_STATE.LOGGED_OUT,
    messages: [],
    playerId: "",
    players: {},
    dealer: {
        upCards: [],
        didBust: false
    }
}

const rootReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case START_GAME_SUCCESS: 
            return {
                ...state,
                players: action.payload.players
            }
        case NEW_MESSAGE:
            return {...state, messages: action.payload.messages}
        case INVALID_USERNAME:
            return {...state, loginState: LOGIN_STATE.INVALID_LOGIN}
        case CONNECTED:
            return {
                ...state,
                loginState: LOGIN_STATE.LOGGED_IN,
                isConnected: true,
                playerId: action.payload.id,
                players: action.payload.players
            }
        default:
            return state;
    }
}

export default createStore(rootReducer, applyMiddleware(thunkMiddleware));