import React from "react";
import { inject, observer } from 'mobx-react';

import SelectCard from "./SelectCard.js";

class Cards extends React.Component {
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

    canSelect(card) {
        for (let c of this.props.suggestion) {
            if (c.name === card) {
                return true;
            }
        }
        return false;
    }

    isSelected(card) {
        if (this.state.selected) {
            if (this.state.selected === card) {
                return 1;
            } else {
                return -1;
            }
        } else {
            return 0;
        }
    }

    render() {
        let cardItems = [];
        let cards = this.props.cards;
        for (const[id, card] of Object.entries(cards)) {
            cardItems.push(
                <SelectCard key={card.name} name={card.name} setCard={( () => this.setCard(card.name))} canSelect={this.canSelect(card.name)} isSelected={this.isSelected(card.name)}/>
            )
        }

        cardItems.push(
            <SelectCard key='None' name='None' id='none-card' setCard={( () => this.setCard('none'))} canSelect={true} isSelected={this.isSelected('none')}/>
        )

        return (
            <>
            <div className="counter-cards">
                {cardItems}
            </div>
            <div className='submit-area'>
                <div className="action" id="submit-button" onClick={() => this.submitCard()}>
                    Submit
                </div>
            </div>
            </>
        )
    }
} export default inject('store') (observer(Cards));
