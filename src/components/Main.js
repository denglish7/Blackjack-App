import React from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Button, Container} from "reactstrap";
import Messages from "../components/Messages";
import Form from "../components/Form";
import ChatBox from "../components/ChatBox";
import { start } from "../redux/actions";

const Main = () => {

    const dispatch = useDispatch();

    const username = useSelector(state => state.username);
    const deck_id = useSelector(state => state.deck_id);
    const players = useSelector(state => state.players);
    const state = useSelector(state => state);

    return (
        <Container style={{backgroundColor: 'green', width:'100%', height: '100%'}}>
            Welcome {username}
            <Button onClick={() => dispatch(start())}>Start Game</Button>

            <Button onClick={() => console.log("state here", state)}>Show State</Button>
            <ChatBox />

        </Container>
        
  )
}

export default Main;