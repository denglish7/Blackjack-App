import React from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Container, Row, Col} from "reactstrap";
import ChatBox from "../components/ChatBox";
import Player from "../components/Player";
import Dealer from "../components/Dealer";
import { start } from "../redux/actions";

const Main = () => {

    const dispatch = useDispatch();

    const state = useSelector(state => state);
    const players = useSelector(state => state.players);
    const playerId = useSelector(state => state.playerId);
    const username = players[playerId].username;
    const gameStarted = useSelector(state => state.gameStarted);

    const playerView = Object.keys(players).map((id, index) => {
        if (players[id].isPlaying === true) {
            return <Player key={index} id={id} {...players[id]} />;
        }
        return null;
        
    })

    return (
        <div className="main">
            <div className="welcome">
                <h3>Welcome {username}</h3>
                {
                    gameStarted === false ? <Button onClick={() => dispatch(start())}>Start Game</Button> : null
                }
                <Button onClick={() => console.log("state here", state)}>Show State</Button>
            </div>
            <div>
                <Dealer />
            </div>

            <div>
                {playerView}
            </div>

           
            <ChatBox />

        </div>
        
  )
}

export default Main;