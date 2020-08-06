/** SERVER CONFIGURATION */
const express = require("express");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require("path");
const fetch = require("node-fetch");

// Choose a port, default is 4002 (could be almost anything)
const PORT = process.env.PORT || 4002;

// When on Heroku, serve the UI from the build folder
if (process.env.NODE_ENV === 'production') {  
    app.use(express.static(path.join(__dirname, 'build')));  
    app.get('*', (req, res) => {    
        res.sendfile(path.join(__dirname = 'build/index.html'));  
    })
}

// When on local host, server from the public folder. 
// Rule will not be written if production conditional has executed
app.get('*', (req, res) => {  
    app.sendFile(path.join(__dirname+'public/index.html'));
})

// Listen for client connections
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const messages = [];

const gameState = {
    gameStarted: false,
    table: [],
    players: {},
    deck: {},
    currentTurnIndex: 0,
    dealer: {
        upCards: [],
        downCard: [],
        didBust: false
    },
}

const getDeck = async () => {
	let BASE_URL = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6";
	let response = await fetch(BASE_URL);
	let data = response.json();
	
	return data;
}

const processMessage = msg => {
    messages.push(msg);
    io.sockets.emit("all messages", messages);
}

const requestBet = () => {
    io.sockets.emit("get bet for player",)
}

io.on("connection", client => {
    client.emit("notification", "Hello, " + client.id);

    client.on("check username", username => {
        for (let player in gameState.players) {
            if (gameState.players[player].username === username) {
                client.emit("invalid username");
                return;
            }
        }
        client.emit("valid username", username);
    })

    client.on("join", username => {
        let newPlayer = {
            username: username,
            hand: [],
            chips: 500,
            bet: 0,
            isPlaying: false,
            didBet: false,
            didStay: false,
            didBust: false
        };

        gameState.players[client.id] = newPlayer;
        gameState.table.push(client.id);

        client.emit("game joined", client.id, gameState.players);
        processMessage(username + " has joined");
    })

    client.on("new message", msg => {
        processMessage(gameState.players[client.id].username + " says: " + msg);
    })

    client.on("disconnect", () => {
        if (gameState.players.hasOwnProperty(client.id))
            processMessage(gameState.players[client.id].username + " has left");
    })

    client.on("start game", () => {
        for (let player in gameState.players) {
            gameState.players[player].isPlaying = true;
        }
        io.sockets.emit("starting game");
        getDeck().then(data => {
            gameState.deck = data;
            console.log("decks here", gameState.deck);
            gameState.gameStarted = true;
            io.sockets.emit("start game success", gameState.players);
        }).catch(error => {
            console.log(error);
            io.sockets.emit("start game failure");
        })
    })
})