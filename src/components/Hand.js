import React from "react";

const Hand = (props) => {
    const INTERVAL = 15;
    const getMargin = (index) => {
        let margin = index * INTERVAL;
        let marginString = margin + "px"
        return marginString;
    }

    const cards = props.cards.map((card, index) => {
        if (card.value === null) {
            return <li key={index} style={{float: "right", marginRight: getMargin(index)}}><img className="card" key={index} src={process.env.PUBLIC_URL + "/images/playing-card.png"} alt="card" /></li>
        }
        return <li key={index} style={{float: "right", marginRight: getMargin(index)}}><img className="card" key={index} src={card.image} alt="card" /></li>
    })
    
    return (
        <div className="hand">
            <ul>
                {cards}
            </ul>
        </div>
        
    )
}

export default Hand;