import React, {useState} from "react";
import {useDispatch} from "react-redux";
import Slide from "./Slide";
import SlideIndicator from "./SlideIndicator";
import {completeOnboarding} from "../redux/actions";

const TOTAL_SLIDES = 2;

const OnboardingSlides = () => {
    const [activeSlide, setActiveSlide] = useState(1);

    const dispatch = useDispatch();

    const setSlideState = id => {
        if (id === activeSlide)
            return "active";
        return "inactive";
    }

    const nextSlide = () => {
        let id = activeSlide;
        id < TOTAL_SLIDES ? setActiveSlide(id + 1) : dispatch(completeOnboarding());
    }

    const generateSlideIndicators = () => {
        let indicators = [];
        for (let i = 1; i <= TOTAL_SLIDES; i++) {
            indicators.push(
                <SlideIndicator slideStatus={setSlideState(i)} key={i} 
                                slideID={i} 
                                clickHandler={() => setActiveSlide(i)} />
            )
        }
        return indicators;
    }

    return (
        <div className="slides-bg">
            <Slide slideStatus={setSlideState(1)} slideId={1}>
                <h1>Place your bet by selecting an amount</h1>
                <p>Click the value you'd like to add to your bet</p>
                <div className="fit my-4">
                    <img src={process.env.PUBLIC_URL + "/images/betting.gif"}
                        className="my-4 float-right fit slide-image" alt="Blackjack screen gif showing bet funtionality." />
                </div>
            </Slide>
            <Slide slideStatus={setSlideState(2)} slideId={2}>
                <h1>Choose your move</h1>
                <p>Choose to Hit, Stay, or Double Down if possible
                </p>
                <div className="fit my-4">
                    <img src={process.env.PUBLIC_URL + "/images/actions.gif"}
                         className="img-fluid my-4 float-right fit slide-image"
                         alt="Blackjack screen gif showing actions funtionality." />
                </div>
            </Slide>
            <div className="slides-controls">
                <button className="align-left control-btn" onClick={() => dispatch(completeOnboarding())}>Skip</button>
                <div className="align-center">
                    {generateSlideIndicators()}
                </div>
                <button className="align-right control-btn" onClick={nextSlide}>
                    {
                        activeSlide < TOTAL_SLIDES ? "Next" : "Done"
                    }
                </button>
            </div>
        </div>
    )
}
export default OnboardingSlides;