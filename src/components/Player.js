import React from 'react';
import {useSelector} from "react-redux";
import { Row } from "reactstrap";
import BetForm from "../components/BetForm";
import ActionForm from "../components/ActionForm";
import Hand from "../components/Hand";
import { GAME_STATUS, FINAL_STATUS } from '../redux/store';

const Player = (props) => {
    const playingPlayerId = useSelector(state => state.playingPlayerId);
    const playerId = useSelector(state => state.playerId);
    const players = useSelector(state => state.players);
    const gameStatus = useSelector(state => state.gameStatus);
    const chips = players[playerId].chips;

    const getMessage = () => {
        if (props.finalStatus === FINAL_STATUS.DID_BUST) {
            return <h3>Busted</h3>
        } else if (props.finalStatus === FINAL_STATUS.HIT_BLACKJACK) {
            return <h3>Blackjack!</h3>
        } else if (props.finalStatus === FINAL_STATUS.DID_PUSH) {
            return <h3>Push</h3>;
        } else if (props.finalStatus === FINAL_STATUS.DID_WIN) {
            return <h3>{props.username} won!</h3>
        } else if (props.finalStatus === FINAL_STATUS.DID_LOSE){
            return <h3>{props.username} lost.</h3>
        } else {
            return null;
        }
    }

    return (
        <div className="player-container" xs="6" sm="4">
            <Row className="row-container">
                <h3 className="username">{props.username}</h3>

            </Row>
            <Row className="row-container">
                {
                    props.id === playerId ? <p className="username">chips: {chips}</p> : <p className="username">{players[props.id].chips}</p>
                }
            </Row>
            <Row className="row-container">
                {
                    players[props.id].bet !== 0 ? 
                        <div className="bet-area">
                            <div classname="chip">
                                {players[props.id].bet}
                            </div>
                        </div>
                            : <div className="bet-area"></div> 
                }
                {
                    props.id === playingPlayerId && props.id === playerId && gameStatus === GAME_STATUS.GETTING_BETS ?
                        <BetForm {...props} /> 
                        : null
                }
            </Row>
            <Row className="row-container">
                { getMessage() }
            </Row>

            <Row className="row-container">
                {
                    props.id === playingPlayerId && props.id === playerId &&
                        gameStatus === GAME_STATUS.TAKING_ACTIONS ?
                        <ActionForm handSize={props.hand.length}/> 
                        : null
                }
            </Row>

            <Row className="row-container">
                { props.hand.length > 0 ? <Hand cards={props.hand} /> : null }
            </Row>
        </div>
    )
}

export default Player;