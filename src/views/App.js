import React from 'react';
import {useSelector} from "react-redux";
import {Container} from "reactstrap";
import Main from "../components/Main";
import JoinGame from "../components/JoinGame";

const App = () => {

    const isConnected = useSelector(state => state.isConnected);

    return (
        <Container>
            {
                isConnected ?
                    <>
                        <Main />
                    </>
                    :
                    <JoinGame/>
            }
            
        </Container>
  )
}

export default App;