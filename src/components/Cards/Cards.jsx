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
        let size = this.props.size;
        if (cards) {
            for (const[id, card] of Object.entries(cards)) {
                cardItems.push(
                    <Card size={size} key={card.name} name={card.name}/>
                )
            }   
        }
        
        return (
            <div key="cards" className="cards">
                {cardItems}
            </div>
        )
    }
} export default inject('store') (observer(Cards));
