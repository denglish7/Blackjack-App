import React from 'react';
import {useSelector} from "react-redux";
import {Container} from "reactstrap";
import Main from "../components/Main";
import JoinGame from "../components/JoinGame";
import OnboardingSlides from '../components/OnboardingSlides';

const App = () => {

    const isConnected = useSelector(state => state.isConnected);
    const onboardingComplete = useSelector(state => state.onboardingComplete);

    const mainScreen = () => {
        if (onboardingComplete === true) {
            return <Main />
        } else {
            return <OnboardingSlides />
        }
    }

    return (
        <div className="main">
            {
                isConnected ?
                    mainScreen()
                    :
                    <JoinGame/>
            }
            
        </div>
  )
}

export default App;