import {createStore, applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk";
import {
    NEW_MESSAGE, 
    CONNECTED, 
    START_GAME_SUCCESS, 
    SET_CLIENT_ID, 
    INVALID_USERNAME, 
    REQUEST_BET_BY_ID,
    REQUEST_ACTION_BY_ID,
    GET_PLAYERS,
    BETTING_DONE,
    END_HAND,
    GAME_OVER
} from "./actionConstants";


export const LOGIN_STATE = {
    LOGGED_IN: "logged in",
    LOGGED_OUT: "logged out",
    INVALID_LOGIN: "invalid login",
    NETWORK_ERROR: "network error"
}

export const GAME_STATUS = {
    GETTING_BETS: "GETTING_BETS",
    DEALING_CARDS: "DEALING_CARDS",
    TAKING_ACTIONS: "TAKING_ACTIONS",
    HAND_OVER: "HAND_OVER"
}

export const FINAL_STATUS = {
    DID_WIN: "DID_WIN",
    DID_LOSE: "DID_LOSE",
    DID_BUST: "DID_BUST",
    HIT_BLACKJACK: "HIT_BLACKJACK",
    DID_PUSH: "DID_PUSH"
}

export const ACTION_TYPE = {
    HIT: "HIT",
    NEXT: "NEXT",
    SURRENDER: "SURRENDER",
    DOUBLE_DOWN: "DOUBLE_DOWN",
    SPLIT: "SPLIT"
}

const INITIAL_STATE = {
    isConnected: false,
    gameStarted: false,
    loginState: LOGIN_STATE.LOGGED_OUT,
    gameStatus: null,
    messages: [],
    table: [],
    playerId: "",
    playingPlayerId: "",
    players: {},
    action: null,
    dealer: {
        hand: [],
        handValue: 0,
        didBust: false,
        hitBlackjack: false
    }
}

const rootReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case BETTING_DONE: 
            return {
                ...state,
                gameStatus: GAME_STATUS.DEALING_CARDS
            }
        case GET_PLAYERS:
            return {
                ...state,
                players: action.payload.players,
                dealer: action.payload.dealer
            }
        case START_GAME_SUCCESS:
            return {
                ...state,
                gameStarted: true,
                players: action.payload.players,
                dealer: action.payload.dealer
            }
        case REQUEST_ACTION_BY_ID:
            return {
                ...state,
                gameStatus: GAME_STATUS.TAKING_ACTIONS,
                playingPlayerId: action.payload.playerId
            }
        case REQUEST_BET_BY_ID:
            return {
                ...state,
                gameStatus: GAME_STATUS.GETTING_BETS,
                playingPlayerId: action.payload.playerId
            }
        case SET_CLIENT_ID:
            return {
                ...state,
                playerId: action.payload.clientId
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
                players: action.payload.players,
                table: action.payload.table
            }
        case END_HAND:
            return {
                ...state,
                players: action.payload.players,
                dealer: action.payload.dealer,
                gameStatus: GAME_STATUS.HAND_OVER
            }
        case GAME_OVER:
            return INITIAL_STATE;
        default:
            return state;
    }
}

export default createStore(rootReducer, applyMiddleware(thunkMiddleware));