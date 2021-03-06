import React from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button} from "reactstrap";
import {userTakeAction} from "../redux/actions";
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
                <Button className="button" onClick={() => submitAction(ACTION_TYPE.HIT)}>HIT</Button>
                <Button className="button" onClick={() => submitAction(ACTION_TYPE.NEXT)}>STAY</Button>
                {
                    props.handSize === 2 ? <Button onClick={() => submitAction(ACTION_TYPE.DOUBLE_DOWN)}>DOUBLE DOWN</Button> : null
                }
            </div>
        </div>

    )
}

export default ActionForm;