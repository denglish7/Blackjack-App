import React, {useState} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Container, Row, Col} from "reactstrap";
import BetForm from "../components/BetForm";
import Hand from "../components/Hand";
import { GAME_STATUS } from '../redux/store';

const Player = (props) => {
    const playingPlayerId = useSelector(state => state.playingPlayerId);
    const playerId = useSelector(state => state.playerId);
    const players = useSelector(state => state.players);
    const [chips, setChips] = useState(props.chips);
    const gameStatus = useSelector(state => state.gameStatus);

    const dispatch = useDispatch();
    console.log("props.hand", props.hand);

    let style;
    if (playerId === playingPlayerId) {
        style = "my-turn";
    } else {
        style = "not-my-turn";
    }

    return (
        <div className="player-container" xs="6" sm="4">
            <p>{props.username}</p>

            {
                props.id === playerId ? <p>{chips}</p> : <p>{players[props.id].chips}</p>
            }
            
            {
                props.id === playingPlayerId && props.id === playerId && gameStatus === GAME_STATUS.GETTING_BETS ?
                    <BetForm setChips={setChips} {...props} /> 
                    : null
            }


            { props.hand.length > 0 ? <Hand cards={props.hand} /> : null }
            
        </div>
    )
}

export default Player;