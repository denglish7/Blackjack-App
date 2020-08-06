import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import { FormGroup, Label, Input, FormFeedback, Button } from "reactstrap";
import { connectToGame } from "../redux/actions";
import { LOGIN_STATE } from "../redux/store";

const JoinGame = () => {
    const [username, setUsername] = useState("");
    const [isValid, setIsValid] = useState(true);
    const loginState = useSelector(state => state.loginState);

    const dispatch = useDispatch();

    const processInput = event => {
        if (event.target.value.length > 0)
            setIsValid(true);
        else setIsValid(false);
        setUsername(event.target.value);
    }

    const verifyUsername = () => {
        if (username.length > 0) {
            console.log("clicked herjekfdjk");
            dispatch(connectToGame(username))
        } else {
            setIsValid(false);
        }
    }

    const onKeyUp = event => {
        if (event.keyCode === 13)
            verifyUsername();
    }

    return (
        <>
            <FormGroup className="mt-4">
                <Label for="username">Enter your username:</Label>
                {
                    isValid ?
                        <Input id="username" value={username} 
                            onChange={processInput}
                            onKeyUp={onKeyUp} />
                        :
                        <Input id="username" value={username} invalid
                            onChange={processInput}
                            onKeyUp={onKeyUp} />
                }
                <FormFeedback invalid="true">Username cannot be empty!</FormFeedback>
            </FormGroup>
            {loginState === LOGIN_STATE.INVALID_LOGIN ? <p>Username taken!</p> : null}
            <Button className="float-right my-4" onClick={verifyUsername}>
                Join Game
            </Button>
        </>
    )
}

export default JoinGame;