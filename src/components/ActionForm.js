import React, {useState} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button} from "reactstrap";
import {placeNewBet, userTakeAction} from "../redux/actions";
import { ACTION_TYPE } from '../redux/store';

const ActionForm = (props) => {
    const playerId = useSelector(state => state.playerId);
    
    const dispatch = useDispatch();

    const submitAction = (actionType) => {
        dispatch(userTakeAction(playerId, actionType));
    }

    return (
        <div>
            <div className="chip-container">
                <Button onClick={() => submitAction(ACTION_TYPE.HIT)}>HIT</Button>
                <Button onClick={() => submitAction(ACTION_TYPE.STAY)}>STAY</Button>
                <Button onClick={() => submitAction(ACTION_TYPE.SURRENDER)}>SURRENDER</Button>
            </div>
            
        </div>

    )
}

export default ActionForm;