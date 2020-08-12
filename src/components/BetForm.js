import React, {useState} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Container, Row, Col} from "reactstrap";
import {placeNewBet} from "../redux/actions";

const BetForm = (props) => {
    const [totalBet, setTotalBet] = useState(0);
    const [invalidBet, setInvalidBet] = useState(false);
    const [playerTotalChips, setPlayerTotalChips] = useState(props.chips);
    const playerId = useSelector(state => state.playerId);
    
    const dispatch = useDispatch();

    const addToBet = (amount) => {
        console.log("total bet", totalBet);
        console.log("amount", amount);
        console.log("playerTotalchips", playerTotalChips);
        if (totalBet + amount <= playerTotalChips + totalBet) {
            setTotalBet(totalBet + amount);
            let newPlayerTotalChips = playerTotalChips - amount;
            props.setChips(newPlayerTotalChips);
            setPlayerTotalChips(newPlayerTotalChips)
            setInvalidBet(false);
        } else {
            setInvalidBet(true);
        }
    }

    const clearBet = () => {
        props.setChips(props.chips);
        setPlayerTotalChips(props.chips);
        setTotalBet(0);
        setInvalidBet(false);
    }

    const placeBet = (newChips, newBet) => {
        dispatch(placeNewBet(playerId, newChips, newBet));
    }

    return (
        <div>
            <div className="chip-container">
                {invalidBet === true ? <p>not enough chips</p> : null }
                {totalBet > 0 ? <div className="chips-bet">{totalBet}</div> : null}

                <div onClick={() => addToBet(5)} className="chip">5</div>
                <div onClick={() => addToBet(25)} className="chip">25</div>
                <div onClick={() => addToBet(50)} className="chip">50</div>
            </div>
            <Button onClick={() => clearBet()}>Clear</Button>
            <Button onClick={() => placeBet(playerTotalChips, totalBet)}>Bet</Button>
        </div>

    )
}

export default BetForm;