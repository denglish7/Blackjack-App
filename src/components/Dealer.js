import React from "react";
import {useSelector, useDispatch} from "react-redux";
import {Button, Container, Row, Col} from "reactstrap";
import Hand from "../components/Hand";


const Dealer = () => {
    const dealer = useSelector(state => state.dealer);
    const dispatch = useDispatch();

    return (
        <Col className="player-container" xs="6" sm="4">
            <p>Dealer</p>
            {
                dealer.hand.length > 0 ? <Hand cards={dealer.hand} /> : null
            }

        </Col>
    )
}

export default Dealer;