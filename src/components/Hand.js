import React from "react";
import { Media } from "reactstrap";
import {useSelector} from "react-redux";

const Hand = (props) => {
    const cards = props.cards.map((card, index) => {
        if (index % 2 === 0) {
            if (card.value === null) {
                return <img className="even-card down-card" key={index} src={process.env.PUBLIC_URL + "/images/playing-card.png"} alt="card" />
            }
            return <img className="even-card" key={index} src={card.image} alt="card" />
        } else {
            if (card.value === null) {
                return <img className="odd-card down-card" key={index} src={process.env.PUBLIC_URL + "/images/playing-card.png"} alt="card" />
            }
            return <img className="odd-card" key={index} src={card.image} alt="card" />
        }
        
    })
    
    return (
        <div className="hand">
            {cards}
        </div>
    )
}

export default Hand;