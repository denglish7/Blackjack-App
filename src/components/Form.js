import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {FormGroup, Input, Label, Button } from "reactstrap";
import {sendToChat} from "../redux/actions";

const Form = () => {
    const [messageTxt, setMessageTxt] = useState("");
    const [isValid, setIsValid] = useState(false);

    const dispatch = useDispatch();

    const sendMessageAndClearForm = () => {
        dispatch(sendToChat(messageTxt));
        setMessageTxt("");
    }

    const processInput = event => {
        setMessageTxt(event.target.value);
        if (event.target.value.length > 0) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }

    return (
        <>
            <FormGroup>
                <Label for="messageTxt">Your message:</Label>
                <Input id="messageTxt" type="textarea"
                    placeholder="Enter your message" value={messageTxt}
                    onChange={processInput}/>
            </FormGroup>
            <Button className="float-right" disabled={isValid === false}
                onClick={sendMessageAndClearForm}>
                    Send
            </Button>
        </>
    )
}

export default Form;