import React, {useState} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Container, Row, Col} from "reactstrap";
import BetForm from "../components/BetForm";
import ActionForm from "../components/ActionForm";
import Hand from "../components/Hand";
import { GAME_STATUS, FINAL_STATUS } from '../redux/store';

const Player = (props) => {
    const playingPlayerId = useSelector(state => state.playingPlayerId);
    const playerId = useSelector(state => state.playerId);
    const players = useSelector(state => state.players);
    // const [chips, setChips] = useState(props.chips);
    const gameStatus = useSelector(state => state.gameStatus);
    const chips = players[playerId].chips;
    const dispatch = useDispatch();

    let style;
    if (playerId === playingPlayerId) {
        style = "my-turn";
    } else {
        style = "not-my-turn";
    }

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
            <Row>
                <h3>{props.username}</h3>
                {
                    props.id === playerId ? <p>hello{chips}</p> : <p>{players[props.id].chips}</p>
                }
            </Row>
            <Row>
                <div className="circle"></div>
                { players[props.id].bet > 0 ? <div className="chip">{players[props.id].bet}</div> : null }
                {
                    props.id === playingPlayerId && props.id === playerId && gameStatus === GAME_STATUS.GETTING_BETS ?
                        <BetForm {...props} /> 
                        : null
                }
            </Row>
            <Row>
                { getMessage() }
            </Row>

            <Row>
                {
                    props.id === playingPlayerId && props.id === playerId &&
                        gameStatus === GAME_STATUS.TAKING_ACTIONS ?
                        <ActionForm handSize={props.hand.length}/> 
                        : null
                }
            </Row>

            <Row>
                { props.hand.length > 0 ? <Hand cards={props.hand} /> : null }
            </Row>
            
            
        </div>
    )
}

export default Player;