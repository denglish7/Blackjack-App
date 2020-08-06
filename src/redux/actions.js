import {
    NEW_MESSAGE, 
    CONNECTED,
    STARTING_GAME,
    START_GAME_SUCCESS,
    START_GAME_FAIL,
    INVALID_USERNAME
} from "./actionConstants";
import {checkUsername, sendMessage, startGame} from "../client";

export const startingGame = () => ({
    type: STARTING_GAME
})

export const startGameSuccess = (players) => ({
    type: START_GAME_SUCCESS,
    payload: {
        players
    }
})

export const startGameError = () => ({
    type: START_GAME_FAIL
})

export const isConnected = (id, players) => ({
    type: CONNECTED,
    payload: {
        id,
        players
    }
})

export const newMessage = messages => ({
    type: NEW_MESSAGE,
    payload: {
        messages
    }
})

export const invalidUsername = () => ({
    type: INVALID_USERNAME
})

export const connectToGame = username => {
    return dispatch => checkUsername(username);
}

export const sendToChat = msg => {
    return dispatch => sendMessage(msg);
}

export const start = () => {
    return dispatch => {
        startGame();
    }
}