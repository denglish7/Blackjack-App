import React from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Row, Col} from "reactstrap";
import ChatBox from "../components/ChatBox";
import Player from "../components/Player";
import Dealer from "../components/Dealer";
import { start } from "../redux/actions";
import { GAME_STATUS } from '../redux/store';

const Main = () => {
    const players = useSelector(state => state.players);
    const playerId = useSelector(state => state.playerId);
    const username = players[playerId].username;
    const gameStarted = useSelector(state => state.gameStarted);
    const gameStatus = useSelector(state => state.gameStatus);

    const dispatch = useDispatch();

    const playerView = Object.keys(players).map((id, index) => {
        if (players[id].isPlaying === true) {
            return <Col sm={12} xs={12} md={4}><Player key={index} id={id} {...players[id]} /></Col>;
        }
        return null;
    })

    return (
        <div className="main">
            <div className="welcome">
                <h3>Welcome {username}</h3>
                {
                    gameStatus === GAME_STATUS.HAND_OVER ? <Button className="button" onClick={() => dispatch(start())}>New Hand</Button> : null
                }
                {
                    gameStarted === false ? <Button className="button" onClick={() => dispatch(start())}>Start Game</Button> : null
                }
            </div>
            <Row>
                <div>
                    <Dealer />
                </div>
            </Row>
            <Row>
                {playerView}
            </Row>

            <ChatBox />

        </div>
        
  )
}

export default Main;