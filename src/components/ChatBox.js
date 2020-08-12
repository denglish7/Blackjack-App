import React, { useEffect, useRef }from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Container} from "reactstrap";
import Messages from "../components/Messages";
import Form from "../components/Form";
import { start } from "../redux/actions";
import ScrollToBottom from "react-scroll-to-bottom";

const ChatBox = () => {
    const dispatch = useDispatch();

    return (
        <>
            <div className="chatbox">
                <Messages/> 
            </div>
            <Form/>
        </>
  )
}

export default ChatBox;