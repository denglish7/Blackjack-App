import React from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Container} from "reactstrap";
import Messages from "../components/Messages";
import Form from "../components/Form";
import { start } from "../redux/actions";

const ChatBox = () => {

    const dispatch = useDispatch();

    return (
        <div className="chatbox">
            <Messages/>
            <Form/>
        </div>
  )
}

export default ChatBox;