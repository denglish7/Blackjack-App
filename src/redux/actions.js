import {
    NEW_MESSAGE, 
    CONNECTED,
    STARTING_GAME,
    START_GAME_SUCCESS,
    START_GAME_FAIL,
    INVALID_USERNAME,
    SET_CLIENT_ID,
    REQUEST_BET_BY_ID,
    REQUEST_ACTION_BY_ID,
    GET_PLAYERS,
    BETTING_DONE,
    PLAYER_BLACKJACK,
    GAME_OVER,
    END_HAND
} from "./actionConstants";
import {checkUsername, sendMessage, startGame, submittingBet, placeBet, takeAction} from "../client";

export const requestBetById = (playerId) => ({
    type: REQUEST_BET_BY_ID,
    payload: {
        playerId
    }
})

export const requestActionById = (playerId) => ({
    type: REQUEST_ACTION_BY_ID,
    payload: {
        playerId
    }
})

export const setClientId = (clientId) => ({
    type: SET_CLIENT_ID,
    payload: {
        clientId
    }
})

export const startingGame = () => ({
    type: STARTING_GAME
})


export const getPlayers = (players, dealer) => ({
    type: GET_PLAYERS,
    payload: {
        players,
        dealer
    }
})

export const bettingDone = () => ({
    type: BETTING_DONE
})

export const playerGotBlackjack = (playerId) => ({
    type: PLAYER_BLACKJACK,
    payload: {
        playerId
    }
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

export const isConnected = (players, table) => ({
    type: CONNECTED,
    payload: {
        players,
        table
    }
})

export const newMessage = messages => ({
    type: NEW_MESSAGE,
    payload: {
        messages
    }
})

export const endHand = (players, dealer) => ({
    type: END_HAND,
    payload: {
        players,
        dealer
    }
})


export const invalidUsername = () => ({
    type: INVALID_USERNAME
})

export const endGame = () => ({
    type: GAME_OVER
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

export const submitBet = () => {
    return dispatch => {
        submittingBet();
    }
}

export const placeNewBet = (playerId, newChips, newBet) => {
    return dispatch => {
        placeBet(playerId, newChips, newBet);
    }
}

export const userTakeAction = (playerId, actionType) => {
    return dispatch => {
        takeAction(playerId, actionType);
    }
}

