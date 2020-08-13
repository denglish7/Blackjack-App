import React from "react";
import {useSelector, useDispatch} from "react-redux";
import {Button, Container, Row, Col} from "reactstrap";
import Hand from "../components/Hand";
import { FINAL_STATUS } from '../redux/store';

const Dealer = () => {
    const dealer = useSelector(state => state.dealer);
    const dispatch = useDispatch();

    console.log("dealer here", dealer);

    const getMessage = () => {
        if (dealer.finalStatus === FINAL_STATUS.DID_BUST) {
            return <h3>Busted</h3>
        } else if (dealer.finalStatus === FINAL_STATUS.HIT_BLACKJACK) {
            return <h3>Blackjack!</h3>
        } else {
            return null;
        }
    }

    return (
        <Col className="player-container" xs="6" sm="4">
            <p>Dealer</p>
            {
                dealer.hand.length > 0 ? <Hand cards={dealer.hand} /> : null
            }

            {getMessage()}

        </Col>
    )
}

export default Dealer;