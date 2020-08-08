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
    deck: {
        deck_id: "",
        remaining: null
    },
    currentTurnIndex: 0,
    dealerDownCard: {},
    dealer: {
        hand: [],
        didBust: false
    }
}

const ACTION_TYPE = {
    HIT: "HIT",
    STAY: "STAY",
    SURRENDER: "SURRENDER",
    DOUBLE_DOWN: "DOUBLE_DOWN",
    SPLIT: "SPLIT"
}

const getDeck = async () => {
	let BASE_URL = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6";
	let response = await fetch(BASE_URL);
	let data = response.json();
	
	return data;
}

const drawCardFromDeck = async (playerId) => {
    let BASE_URL = "https://deckofcardsapi.com/api/deck/" + gameState.deck.deck_id + "/draw/?count=1";
    let response = await fetch(BASE_URL);
    let data = response.json();
    
    return data;
}

const processMessage = msg => {
    messages.push(msg);
    io.sockets.emit("all messages", messages);
}

const requestBet = () => {
    console.log("table", gameState.table)
    console.log("turn index", gameState.currentTurnIndex)
    io.sockets.emit(
        "request bet for player", gameState.table[gameState.currentTurnIndex]
    );
}

const requestAction = () => {
    io.sockets.emit(
        "request action", gameState.table[gameState.currentTurnIndex]
    )
}

const dealRound = () => {
    io.sockets.emit("deal round beginning");
    requestAction();
}

const dealToDealer = (isDownCard) => {
    drawCardFromDeck().then(data => {
        if (isDownCard === true) {
            gameState.dealerDownCard = data.cards[0];
            gameState.dealer.hand.push({
                "image": null,
                "value": null,
                "suit": null,
                "code": null
            });
        } else {
            gameState.dealer.hand.push(data.cards[0]);
        }
        gameState.deck.remaining = data.remaining;
        io.sockets.emit("get players", gameState.players, gameState.dealer);
    }).catch(error => {
        console.log(error);
        io.sockets.emit("draw card failure");
    });
}

const dealToPlayer = (playerId) => {
    if (gameState.players[gameState.table[playerId]].isPlaying === true) {
        drawCardFromDeck().then(data => {
            gameState.players[gameState.table[playerId]].hand.push(data.cards[0]);
            gameState.deck.remaining = data.remaining;
            io.sockets.emit("get players", gameState.players, gameState.dealer);
        }).catch(error => {
            console.log(error);
            io.sockets.emit("draw card failure");
        });
    }
}



const dealCards = () => {
    gameState.table.push("dealer");
    for (let i = 0; i < 2; i++) {
        for (let playerId in gameState.table) {
            console.log("playerId", playerId);
            if (gameState.table[playerId] === "dealer") {
                if (i === 0) {
                    dealToDealer(true);
                } else {
                    dealToDealer(false);
                }
            } else {
                dealToPlayer(playerId);
            }
        }
    }
    dealRound();
}

const getHandValue = (hand) => {
    let total = 0;
    for (let index in hand) {
        console.log("values here", hand[index])
        total += hand[index].value
    }
    console.log("total", total);
}

const requestActionFromDealer = () => {
    getHandValue(gameState.dealer.hand);
}

const evaluateAction = (playerId, action) => {
    switch(action.ACTION_TYPE) {
        case ACTION_TYPE.HIT:
            if (playerId === "dealer") {
                dealToDealer();
            } else {
                dealToPlayer(playerId);
            }
            requestAction();
            break;
        case ACTION_TYPE.STAY:
            if (gameState.currentTurnIndex === gameState.table.length - 1) {
                io.sockets.emit("dealing round done");
                gameState.currentTurnIndex = 0;
                requestActionFromDealer();
            } else {
                gameState.currentTurnIndex++;
                requestAction();
            }
            break;
        default:
            return null;
    }
}

const gameOver = () => {
    gameState.gameStarted = false;
    gameState.table = [];
    gameState.deck = {
        deck_id: "",
        remaining: null
    };
    gameState.currentTurnIndex = 0;
    gameState.dealerDownCard = {};
    gameState.dealer = {
        hand: [],
        didBust: false
    };
    io.sockets.emit("game over");
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
            action: null,
            didBust: false
        };
        if (Object.keys(gameState.players).length > 2) {
            client.emit("can't join");
            newPlayer.isPlaying = false;
        } else {
            if (gameState.gameStarted === true) {
                newPlayer.isPlaying = false;
            } else {
                newPlayer.isPlaying = true;
            }
            gameState.table.push(client.id);
        }

        gameState.players[client.id] = newPlayer;
        client.emit("client id", client.id);
        io.sockets.emit("game joined", gameState.players, gameState.table);
        processMessage(username + " has joined");
    })

    client.on("new message", msg => {
        processMessage(gameState.players[client.id].username + " says: " + msg);
    })

    client.on("new action", (playerId, action) => {
        requestActionFromDealer();
        // evaluateAction(playerId, action);
    })

    client.on("new bet", (playerId, newChips, newBet) => {
        gameState.players[playerId].chips = newChips;
        gameState.players[playerId].bet = newBet;
        io.sockets.emit("get players", gameState.players, gameState.dealer);
        if (gameState.currentTurnIndex === gameState.table.length - 1) {
            io.sockets.emit("betting done");
            gameState.currentTurnIndex = 0;
            dealCards();
        } else {
            gameState.currentTurnIndex++;
            requestBet();
        }
    })

    client.on("disconnect", () => {
        if (gameState.players.hasOwnProperty(client.id)) {
            processMessage(gameState.players[client.id].username + " has left");
            delete gameState.players[client.id];
            for (let i = 0; i < gameState.table.length; i++) {
                if (gameState.table[i] === client.id) {
                    gameState.table.splice(i, 1); 
                }
            }

            if (gameState.players === {}) {
                console.log("game ended")
                gameOver();
            } else {
                io.sockets.emit("player disconnected", gameState.players, gameState.dealer);
            }
            

        }
    })

    client.on("start game", () => {
        io.sockets.emit("starting game");
        gameState.gameStarted = true;
        for (let player in gameState.players) {
            gameState.players[player].isPlaying = true;
        }
        getDeck().then(data => {
            gameState.deck.deck_id = data.deck_id;
            gameState.deck.remaining = data.remaining;
            gameState.gameStarted = true;
            requestBet();
            io.sockets.emit("start game success", gameState.players);
        }).catch(error => {
            console.log(error);
            io.sockets.emit("start game failure");
        })
    })
})