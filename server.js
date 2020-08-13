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
        finalStatus: null
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


const FINAL_STATUS = {
    DID_WIN: "DID_WIN",
    DID_LOSE: "DID_LOSE",
    DID_BUST: "DID_BUST",
    HIT_BLACKJACK: "HIT_BLACKJACK",
    DID_PUSH: "DID_PUSH"
}

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
        io.sockets.emit("get players", gameState.players, gameState.dealer);
    }).catch(error => {
        console.log(error);
        io.sockets.emit("draw card failure");
    });
}

const drawCard = async () => {
    drawCardFromDeck().then(async data => {
        gameState.dealer.hand.push(data.cards[0]);
        gameState.dealer.handValue = getHandValue(gameState.dealer.hand);
        if (gameState.dealer.handValue < 17) {
            await drawCard();
        }
        console.log("play over in drawCard");
        playOver();
    }).catch(error => {
        console.log(error);
        io.sockets.emit("draw card failure");
    });
}

const dealToDealer = async (isHit = false) => {
    drawCardFromDeck().then(async data => {
        gameState.dealer.hand.push(data.cards[0]);
        gameState.deck.remaining = data.remaining;
        gameState.dealer.handValue = getHandValue(gameState.dealer.hand);
        io.sockets.emit("get players", gameState.players, gameState.dealer);
        checkTotal(DEALER);
        if (isHit === true) {
            if (gameState.dealer.handValue < 17) {
                await drawCard();
            } else {
                console.log("play over in dealToDealer");
                playOver();
            }
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
            gameState.players[playerId].handValue = getHandValue(gameState.players[playerId].hand);
            if (gameState.players[playerId].handValue === TWENTY_ONE) {
                // player hit 21
                if (gameState.players[playerId].hand.length === 2) {
                    // player hit blackjack
                    playerHitBlackjack(playerId);
                    io.sockets.emit("get players", gameState.players, gameState.dealer);
                }
                // io.sockets.emit("get players", gameState.players, gameState.dealer);
                evaluateAction(playerId, ACTION_TYPE.NEXT);
            } else if (gameState.players[playerId].handValue > TWENTY_ONE) {
                gameState.players[playerId].finalStatus = FINAL_STATUS.DID_BUST;
                playerBusted(playerId);
                evaluateAction(playerId, ACTION_TYPE.NEXT);
            }

            io.sockets.emit("get players", gameState.players, gameState.dealer);
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

const checkForBlackjack = () => {
    let dealer = gameState.dealer;
    console.log("checking for Blackjack")
    if (dealer.handValue === TWENTY_ONE && dealer.hand.length === 2) {
        gameState.dealer.finalStatus = FINAL_STATUS.HIT_BLACKJACK;
    }

    for (let index in gameState.table) {
        let playerId = gameState.table[index];
        if (playerId !== DEALER) {
            let player = gameState.players[gameState.table[index]];
            if (dealer.finalStatus === FINAL_STATUS.HIT_BLACKJACK && player.finalStatus === FINAL_STATUS.HIT_BLACKJACK) {
                playerPushed(playerId);
            } else if (player.finalStatus === FINAL_STATUS.HIT_BLACKJACK && dealer.finalStatus !== FINAL_STATUS.HIT_BLACKJACK) {
                playerHitBlackjack(playerId);
            }
        }
    }
}

const checkTotal = () => {
    let hand = gameState.dealer.hand;
    gameState.dealer.handValue = getHandValue(hand);
    if (gameState.dealer.handValue === TWENTY_ONE && hand.length === 2) {
        console.log("dealer hit blackjack");
        gameState.dealer.finalStatus = FINAL_STATUS.HIT_BLACKJACK;
        console.log("play over in checkTotal first");
        playOver();
    } else if (gameState.dealer.handValue > TWENTY_ONE) {
        gameState.dealer.finalStatus = FINAL_STATUS.DID_BUST;
        
        console.log("play over in checkTotal second");
        playOver();
    }
    io.sockets.emit("get players", gameState.players, gameState.dealer);
}

// final actions

const playerBusted = (playerId) => {
    gameState.players[playerId].bet = 0;
    gameState.players[playerId].finalStatus = FINAL_STATUS.DID_BUST;
    io.sockets.emit("get players", gameState.players, gameState.dealer);
}

const playerLost = (playerId) => {
    gameState.players[playerId].bet = 0;
    gameState.players[playerId].finalStatus = FINAL_STATUS.DID_LOSE;
    io.sockets.emit("get players", gameState.players, gameState.dealer);
}

const playerPushed = (playerId) => {
    gameState.players[playerId].finalStatus = FINAL_STATUS.DID_PUSH;
    io.sockets.emit("get players", gameState.players, gameState.dealer);
}

const playerWon = (playerId) => {
    console.log("player wins here", gameState.players[playerId].handValue);
    console.log("playwr wins dealer", gameState.dealer.handValue);
    gameState.players[playerId].finalStatus = FINAL_STATUS.DID_WIN;
    gameState.players[playerId].chips += gameState.players[playerId].bet;
    io.sockets.emit("get players", gameState.players, gameState.dealer);
}

const playerHitBlackjack = (playerId) => {
    let winnings = gameState.players[playerId].bet * BLACKJACK_MULTIPLIER;
    gameState.players[playerId].chips += winnings;
    gameState.players[playerId].finalStatus = FINAL_STATUS.HIT_BLACKJACK;
    io.sockets.emit("get players", gameState.players, gameState.dealer);
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
    console.log("total", total);
    return total;
}

// Action methods

const requestActionFromDealer = async (reveal = false) => {
    console.log("requesting action from dealer");
    let hand = gameState.dealer.hand;
    hand.shift();
    hand.unshift(gameState.dealerDownCard);
    gameState.dealer.handValue = getHandValue(hand);
    io.sockets.emit("get players", gameState.players, gameState.dealer);
    if (gameState.dealer.handValue < 17 && reveal === false) {
        await dealToDealer(true);
    } else {
        playOver();
    }
}

const playOver = () => {
    console.log("game over")
    let dealerFinalStatus = gameState.dealer.finalStatus
    if (gameState.dealer.handValue > TWENTY_ONE) {
        gameState.dealer.finalStatus = FINAL_STATUS.DID_BUST;
    }

    if (dealerFinalStatus === FINAL_STATUS.DID_BUST) {
        for (let i = 0; i < gameState.table.length - 1; i ++) {
            let player = gameState.players[gameState.table[i]];
            if (player.finalStatus !== FINAL_STATUS.DID_BUST) {
                playerWon(gameState.table[i]);
            }
        }
    } else if (dealerFinalStatus === null) {
        for (let i = 0; i < gameState.table.length - 1; i ++) {
            let player = gameState.players[gameState.table[i]];
            if (player.finalStatus === null) {
                let playerHandValue = player.handValue;
                let dealerHandValue = gameState.dealer.handValue;
                if (playerHandValue === dealerHandValue) {
                    console.log("player pushed");
                    console.log("scores player", playerHandValue);
                    console.log("scores dealer", dealerHandValue);
                    playerPushed(gameState.table[i]);
                } else if (playerHandValue > dealerHandValue) {
                    console.log("player won");
                    console.log("scores player", playerHandValue);
                    console.log("scores dealer", dealerHandValue);
                    playerWon(gameState.table[i]);
                } else if (playerHandValue < dealerHandValue) {
                    console.log("player lost");
                    console.log("scores player", playerHandValue);
                    console.log("scores dealer", dealerHandValue);
                    playerLost(gameState.table[i]);
                }
            }
        }
    }
    io.sockets.emit("end hand", gameState.players, gameState.dealer);
}

const evaluateAction = async (playerId, action) => {
    switch(action) {
        case ACTION_TYPE.HIT:
            if (playerId === DEALER) {
                await dealToDealer(true);
                await requestActionFromDealer();
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
                        let finalStatus = gameState.players[gameState.table[index]].finalStatus;
                        if (finalStatus === null) {
                            allPlayersOut = false;
                        }
                    }
                }
                console.log("all players out", allPlayersOut);
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
        case ACTION_TYPE.DOUBLE_DOWN:
            await dealToPlayer(playerId);
            gameState.players[playerId].chips -= gameState.players[playerId].bet;
            gameState.players[playerId].bet *= 2;

            io.sockets.emit("get players", gameState.players, gameState.dealer);
            evaluateAction(playerId, ACTION_TYPE.NEXT);
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
        finalStatus: null
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
            finalStatus: null
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
        requestActionFromDealer();
    })

    client.on("new bet", (playerId, newChips, newBet) => {
        gameState.players[playerId].chips = newChips;
        gameState.players[playerId].bet = newBet;
        io.sockets.emit("get players", gameState.players, gameState.dealer);
    })

    client.on("submitting bet", () => {
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
            if (Object.keys(gameState.players).length === 0) {
                gameState.table = [];
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