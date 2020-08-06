import store from "./redux/store";
import {
    newMessage, 
    isConnected,
    startGameSuccess,
    invalidUsername,
    startGameError,
    startingGame
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

socket.on("game joined", (id, players) => {
    store.dispatch(isConnected(id, players));
})

socket.on("start game success", (players) => {
    store.dispatch(startGameSuccess(players));
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
