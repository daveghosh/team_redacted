import React from "react";
import { inject, observer } from 'mobx-react';

import Card from "./Card.js";

class SelectCard extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
        this.state = {
            selected: null
        }
    }

    submitCard() {
        let card = this.state.selected;
        if (card !== null) {
            this.store.submitCard(card);
        }
    }

    setCard(card) {
        this.setState({selected: card});
    }

    isSelected(card) {
        return this.state.selected === card;
    }

    render() {
        let cardItems = [];
        let cards = this.props.cards;
        for (const[id, card] of Object.entries(cards)) {
            cardItems.push(
                <Card key={card.name} name={card.name} setCard={( () => this.setCard(card.name))} isSelected={this.isSelected(card.name)}/>
            )
        }

        cardItems.push(
            <Card key='None' name='None' id='none-card' setCard={( () => this.setCard('none'))} isSelected={this.isSelected('none')}/>
        )

        return (
            <>
            <div className="cards select-cards">
                {cardItems}
            </div>
            <div className="action" id="submit-button" onClick={() => this.submitCard()}>
                Submit
            </div>
            </>
        )
    }
} export default inject('store') (observer(SelectCard));
