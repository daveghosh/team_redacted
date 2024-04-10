import React from "react";
import { inject, observer } from 'mobx-react';

import Card from "./Card";

class Cards extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
    }

    render() {
        let cardItems = [];
        let cards = this.props.cards;
        for (const[id, card] of Object.entries(cards)) {
            cardItems.push(
                <Card key={card.name} name={card.name}/>
            )
        }
        
        return (
            <div key="cards" className="cards">
                {cardItems}
            </div>
        )
    }
} export default inject('store') (observer(Cards));
