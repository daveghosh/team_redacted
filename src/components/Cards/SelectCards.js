import React from "react";
import { inject, observer } from 'mobx-react';

import SelectCard from "./SelectCard.js";

class SelectCards extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
        let loc = this.store.getCurrentPlayer().loc;
        let room = this.store.locations[loc].name;
        if (this.store.suggestion.mode === 'S') {
            room = '';
        }
        this.state = {
            selected: {
                weapon: '',
                person: '',
                room: room,

            }
        }
        
    }

    submitCards() {
        let cards = [];
        cards.push(this.state.selected.weapon);
        cards.push(this.state.selected.person);
        cards.push(this.state.selected.room);
        if (!cards.includes('')) {
            this.store.submitSuggestion(cards);
        }
    }

    setCard(card) {
        if (card.type !== 'room' || this.store.suggestion.mode !== 'A') {
            let selected = this.state.selected;
            selected[card.type] = card.name;
            this.setState({selected: selected});
        }
    }

    isSelected(card) {
        if (this.state.selected[card.type] !== '') {
            if (this.state.selected[card.type] === card.name) {
                return 1;
            } else {
                return -1;
            }
        } else {
            return 0;
        }
    }

    canSelect(card) {
        if (card.type !== 'room' || this.store.suggestion.mode !== 'A') {
            return true;
        } else {
            return card.name === this.state.selected.room;
        }
    }

    render() {
        let space = (<div className="blank-card"/>);
        let personCardItems = [];
        let weaponCardItems = [];
        let roomCardItems = [];
        let cards = this.store.cards;
        let cardItems;
        for (const[id, card] of Object.entries(cards)) {
            if (id !==  'card22') {
                if (card.type === 'person') {
                    cardItems = personCardItems;
                } else if (card.type === 'weapon') {
                    cardItems = weaponCardItems;
                } else if (card.type === 'room') {
                    cardItems = roomCardItems;
                }

                cardItems.push(
                    <SelectCard key={card.name} name={card.name} setCard={( () => this.setCard(card))} canSelect={this.canSelect(card)} isSelected={this.isSelected(card)}/>
                )
            }
        }

        for (let i = 0; i < 3; i++) {
            weaponCardItems.push(space);
            personCardItems.push(space);
        }
        

        return (
            <>
            <div className="card-rows">
                <div className="select-cards card-row">
                    {personCardItems}
                </div>
                <div className="select-cards card-rom">
                    {weaponCardItems}
                </div>
                <div className="select-cards card-row">
                    {roomCardItems}
                </div>
            </div>
            <div className='submit-area'>
                <div className="action" id="submit-button" onClick={() => this.submitCards()}>
                    Submit
                </div>
            </div>
            </>
        )
    }
} export default inject('store') (observer(SelectCards));
