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
        handValue: 0,
        didBust: false,
        hitBlackjack: false
    }
}

const ACTION_TYPE = {
    HIT: "HIT",
    NEXT: "NEXT",
    SURRENDER: "SURRENDER",
    DOUBLE_DOWN: "DOUBLE_DOWN",
    SPLIT: "SPLIT"
}

const CARD_VALUES = {
    "KING": 10,
    "QUEEN": 10,
    "JACK": 10,
    "ACE": 11
};

const DEALER = "DEALER";
const TWENTY_ONE = 21;
const BLACKJACK_MULTIPLIER = 1.5;

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
    io.sockets.emit(
        "request bet for player", gameState.table[gameState.currentTurnIndex]
    );
}

const requestAction = () => {
    io.sockets.emit(
        "request action for player", gameState.table[gameState.currentTurnIndex]
    )
}

// Dealing methods

const dealDownCard = () => {
    drawCardFromDeck().then(data => {
        gameState.dealerDownCard = data.cards[0];
        gameState.dealer.hand.unshift({
            "image": null,
            "value": null,
            "suit": null,
            "code": null
        })
        gameState.deck.remaining = data.remaining;
        checkTotal(DEALER);
        io.sockets.emit("get players", gameState.players, gameState.dealer);
    }).catch(error => {
        console.log(error);
        io.sockets.emit("draw card failure");
    });
}

const checkForBlackjack = () => {
    let dealer = gameState.dealer;
    
    for (let index in gameState.table) {
        let playerId = gameState.table[index];
        if (playerId !== DEALER) {
            let player = gameState.players[gameState.table[index]];
            if (dealer.hitBlackjack === true && player.hitBlackjack === true) {
                playerPushed()
            } else if (player.hitBlackjack === true && dealer.hitBlackjack === false) {
                playerHitBlackjack();
            }
        }

    }
}

const dealToDealer = (isHit = false) => {
    drawCardFromDeck().then(data => {
        gameState.dealer.hand.push(data.cards[0]);
        gameState.deck.remaining = data.remaining;
        checkTotal(DEALER);
        if (isHit === true) {
            console.log("is hit here");
            io.sockets.emit("dealer hit", gameState.dealer)
        } else {
            checkForBlackjack();
        }
    }).catch(error => {
        console.log(error);
        io.sockets.emit("draw card failure");
    });
}

const dealToPlayer = (playerId) => {
    if (gameState.players[playerId].isPlaying === true) {
        drawCardFromDeck().then(data => {
            gameState.players[playerId].hand.push(data.cards[0]);
            gameState.deck.remaining = data.remaining;
            checkTotal(playerId);
        }).catch(error => {
            console.log(error);
            io.sockets.emit("draw card failure");
        });
    }
}

const dealCards = () => {
    gameState.table.push(DEALER);
    for (let i = 0; i < 2; i++) {
        for (let playerId in gameState.table) {
            if (gameState.table[playerId] === DEALER) {
                if (i === 0) {
                    dealDownCard();
                } else {
                    dealToDealer();
                }
            } else {
                dealToPlayer(gameState.table[playerId]);
            }
        }
    }
    requestAction();
}

// Scoring methods

const playerLost = (playerId) => {
    gameState.players[playerId].bet = 0;
    io.sockets.emit("get players", gameState.players, gameState.dealer);
}

const playerPushed = (playerId) => {
    gameState.players[playerId].didPush = true;
    io.sockets.emit("get players", gameState.players, gameState.dealer);
}

const playerBeatDealer = (playerId) => {
    gameState.players[playerId].chips += gameState.players[playerId].bet;
}

const playerHitBlackjack = (playerId) => {
    let winnings = gameState.players[playerId].bet * BLACKJACK_MULTIPLIER;
    gameState.players[playerId].chips += winnings;
}

const checkTotal = (playerId) => {
    let hand;
    if (playerId === DEALER) {
        hand = gameState.dealer.hand;
    } else {
        hand = gameState.players[playerId].hand;
    }
    if (playerId === DEALER) {
        gameState.dealer.handValue = getHandValue(hand);
        if (gameState.dealer.handValue === TWENTY_ONE && hand.length === 2) {
            gameState.dealer.hitBlackjack = true;
            playOver();
        } else if (gameState.dealer.handValue > TWENTY_ONE) {
            gameState.dealer.didBust = true;
            playOver();
        }
        io.sockets.emit("get players", gameState.players, gameState.dealer);
    } else {
        gameState.players[playerId].handValue = getHandValue(hand);
        if (gameState.players[playerId].handValue === TWENTY_ONE) {
            if (gameState.players[playerId].hand.length === 2) {
                gameState.players[playerId].hitBlackjack = true;
                io.sockets.emit("get players", gameState.players, gameState.dealer);
            }
            io.sockets.emit("get players", gameState.players, gameState.dealer);
            evaluateAction(playerId, ACTION_TYPE.NEXT);
        } else if (gameState.players[playerId].handValue > TWENTY_ONE) {
            gameState.players[playerId].didBust = true;
            playerLost(playerId);
            evaluateAction(playerId, ACTION_TYPE.NEXT);
        }
        io.sockets.emit("get players", gameState.players, gameState.dealer);
    }
}

const getHandValue = (hand) => {
    let total = 0;
    let hasAces = 0;
    for (let index in hand) {
        if (hand[index].value in CARD_VALUES) {
            total += CARD_VALUES[hand[index].value];
            if (hand[index].value === "ACE") {
                hasAces++;
            }
        } else {
            total += parseInt(hand[index].value);
        }
    }
    for (let i = 0; i < hasAces; i++) {
        if (total > TWENTY_ONE) {
            total = total - 10
        }
    }

    return total;
}

// Action methods

const requestActionFromDealer = (reveal = false) => {
    console.log("requesting dealer actions");

    let hand = gameState.dealer.hand;
    hand.shift();
    hand.unshift(gameState.dealerDownCard);
    gameState.dealer.handValue = getHandValue(hand);
    io.sockets.emit("get players", gameState.players, gameState.dealer);
    if (gameState.dealer.handValue < 17 && reveal === false) {
        console.log("dealer under 17");
        dealToDealer(true);
    }
    playOver();
}

const dealerWon = () => {
    for (let i = 0; i < gameState.table.length; i++) {
        gameState.players[gameState.table[i]].bet = 0;

    }
}

const playOver = () => {
    console.log("game over")
    console.log("table", gameState.table);
    // if (gameState.dealer.didBust === true) {
        
    // }
    
}

const evaluateAction = (playerId, action) => {
    switch(action) {
        case ACTION_TYPE.HIT:
            if (playerId === DEALER) {
                dealToDealer(false);
                requestActionFromDealer();
            } else {
                dealToPlayer(playerId);
                requestAction();
            }
            
            break;
        case ACTION_TYPE.NEXT:
            gameState.currentTurnIndex++;
            if (gameState.table[gameState.currentTurnIndex] === DEALER) {
                let allPlayersOut = true;
                for (let index in gameState.table) {
                    if (gameState.table[index] !== DEALER){
                        let didBust = gameState.players[gameState.table[index]].didBust;
                        let hitBlackjack = gameState.players[gameState.table[index]].hitBlackjack;
                        if (didBust === false && hitBlackjack === false) {
                            allPlayersOut = false;
                        }
                    }
                }
                if (allPlayersOut === true) {
                    // tells dealer not to draw
                    requestActionFromDealer(true);
                } else {
                    requestActionFromDealer();
                }
                
            } else {
                requestAction();
            }
            break;
        default:
            return null;
    }
}

const gameOver = () => {
    gameState.gameStarted = false;
    gameState.deck = {
        deck_id: "",
        remaining: null
    };
    gameState.currentTurnIndex = 0;
    gameState.dealerDownCard = {};
    gameState.dealer = {
        hand: [],
        handValue: 0,
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
            handValue: 0,
            chips: 500,
            bet: 0,
            action: null,
            didBust: false,
            hitBlackjack: false,
            didPush: false
        };

        if (Object.keys(gameState.players).length > 2) {
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
        evaluateAction(playerId, action);
    })

    client.on("check dealer hand", (dealer) => {
        console.log("dealer hereereeeee", dealer)
        if (dealer.handValue < 17) {
            requestActionFromDealer();
        } else {
            playOver();
        }
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
            console.log("someone disconnedcted");
            console.log("players", gameState.players)
            if (Object.keys(gameState.players).length === 0) {
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
        for (let index in gameState.table) {
            gameState.players[gameState.table[index]].isPlaying = true;
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