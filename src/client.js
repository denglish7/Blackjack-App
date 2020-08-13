import store from "./redux/store";
import {
    newMessage,
    isConnected,
    startGameSuccess,
    invalidUsername,
    startGameError,
    startingGame,
    setClientId,
    requestBetById,
    getPlayers,
    bettingDone,
    endGame,
    endHand,
    requestActionById,
    playerGotBlackjack
} from "./redux/actions";

/** CLIENT CONFIGURATION - connect to the server */
const socketIOClient = require("socket.io-client");

// When deployed, connect to the hosted server, otherwise connect to local server
// Localhost port must match server
let host = process.env.NODE_ENV === 'production' ?
    "appname.herokuapp.com" : "localhost:4002"
let socket = socketIOClient.connect(host, {secure: true});
// Checks which host we're connected to (for troubleshooting);
console.log("connected to " + host);

socket.on("notification", msg => {
    console.log("Server says: " + msg);
})

socket.on("all messages", result => {
    store.dispatch(newMessage(result));
})

socket.on("game joined", (players, table) => {
    store.dispatch(isConnected(players, table));
})

socket.on("get players", (players, dealer) => {
    console.log("get playeres heres players", players);
    console.log("get players heres dealer", dealer);
    store.dispatch(getPlayers(players, dealer));
})

socket.on("request bet for player", (playerId) => {
    console.log("requesting bet for ", playerId)
    store.dispatch(requestBetById(playerId));
})

socket.on("request action for player", (playerId) => {
    store.dispatch(requestActionById(playerId))
})

socket.on("betting done", () => {
    store.dispatch(bettingDone());
})

socket.on("start game success", (players, dealer) => {
    store.dispatch(startGameSuccess(players, dealer));
})

socket.on("table full", () => {
    console.log("table fulllllllll")
})

socket.on("starting game", () => {
    store.dispatch(startingGame());
})

socket.on("start game failure", () => {
    store.dispatch(startGameError());
})

socket.on("valid username", (username) => {
    joinGame(username);
})

socket.on("invalid username", () => {
    store.dispatch(invalidUsername());
})

socket.on("client id", (clientId) => {
    store.dispatch(setClientId(clientId));
})

socket.on("player disconnected", (players, dealer) => {
    store.dispatch(getPlayers(players, dealer));
})

socket.on("new game", () => {
    store.dispatch(endGame());
})

socket.on("dealer hit", (dealer) => {
    socket.emit("check dealer hand", dealer);
})

socket.on("player got blackjack", (players) => {
    store.dispatch(playerGotBlackjack(players))
})

socket.on("table full", () =>{
    // do this
})

socket.on("end hand", (players, dealer) => {
    store.dispatch(endHand(players, dealer));
})


// This process will allow different clients to have duplicate usernames! A real 
// application should first check with the server to make sure the client's
// username is unique.
export const checkUsername = username => {
    socket.emit("check username", username);
}

export const joinGame = username => {
    socket.emit("join", username);
}

export const sendMessage = msg => {
    socket.emit("new message", msg);
}

export const startGame = () => {
    socket.emit("start game");
}

export const startNewHand = () => {
    socket.emit("start new hand");
}

export const placeBet = (playerId, newChips, newBet) => {
    socket.emit("new bet", playerId, newChips, newBet);
}

export const submittingBet = () => {
    socket.emit("submitting bet");
}

export const takeAction = (playerId, actionType) => {
    socket.emit("new action", playerId, actionType);
}