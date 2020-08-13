import React, {useState} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Container, Row, Col} from "reactstrap";
import {placeNewBet, submitBet} from "../redux/actions";

const BetForm = (props) => {
    const [invalidBet, setInvalidBet] = useState(false);
    const playerId = useSelector(state => state.playerId);
    const players = useSelector(state => state.players);

    const dispatch = useDispatch();

    const addToBet = (amount) => {
        let currentChips = players[playerId].chips;
        let currentBet = players[playerId].bet;
        if (amount <= currentChips) {
            let newChips = currentChips - amount;
            let newBet = currentBet + amount;
            dispatch(placeNewBet(playerId, newChips, newBet));
            setInvalidBet(false);
        } else {
            setInvalidBet(true);
        }
    }

    const clearBet = () => {
        let fullChips = players[playerId].chips + players[playerId].bet;
        let emptyBet = 0;
        dispatch(placeNewBet(playerId, fullChips, emptyBet));
        setInvalidBet(false);
    }

    const placeBet = () => {
        dispatch(submitBet());
    }

    return (
        <div>
            <div className="chip-container">
                {invalidBet === true ? <p>not enough chips</p> : null }


                <div onClick={() => addToBet(5)} className="chip">5</div>
                <div onClick={() => addToBet(25)} className="chip">25</div>
                <div onClick={() => addToBet(50)} className="chip">50</div>
            </div>
            <Button className="button" onClick={() => clearBet()}>Clear</Button>
            <Button className="button" onClick={() => placeBet()}>Bet</Button>
        </div>
    )
}

export default BetForm;