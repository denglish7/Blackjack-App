import React, {useState} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Container, Row, Col} from "reactstrap";
import BetForm from "../components/BetForm";
import ActionForm from "../components/ActionForm";
import Hand from "../components/Hand";
import { GAME_STATUS } from '../redux/store';

const Player = (props) => {
    const playingPlayerId = useSelector(state => state.playingPlayerId);
    const playerId = useSelector(state => state.playerId);
    const players = useSelector(state => state.players);
    const [chips, setChips] = useState(props.chips);
    const gameStatus = useSelector(state => state.gameStatus);

    const dispatch = useDispatch();

    let style;
    if (playerId === playingPlayerId) {
        style = "my-turn";
    } else {
        style = "not-my-turn";
    }

    const getMessage = () => {
        if (props.didBust === true) {
            return <h3>Busted</h3>
        } else if (props.hitBlackjack === true) {
            return <h3>Blackjack!</h3>
        } else {
            return null;
        }
    }

    return (
        <div className="player-container" xs="6" sm="4">
            <p>{props.username}</p>
            {
                props.id === playerId ? <p>Remaining chips: {chips}</p> : <p>{players[props.id].chips}</p>
            }

            <div class="circle"></div>
            { players[props.id].bet > 0 ? <div className="chip">{players[props.id].bet}</div> : null }
            {
                props.id === playingPlayerId && props.id === playerId && gameStatus === GAME_STATUS.GETTING_BETS ?
                    <BetForm setChips={setChips} {...props} /> 
                    : null
            }

            { getMessage() }


            {
                props.id === playingPlayerId && props.id === playerId && gameStatus === GAME_STATUS.TAKING_ACTIONS ?
                    <ActionForm /> 
                    : null
            }


            { props.hand.length > 0 ? <Hand cards={props.hand} /> : null }
            
        </div>
    )
}

export default Player;