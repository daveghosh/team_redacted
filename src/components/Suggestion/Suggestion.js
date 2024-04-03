import React from "react";
import { inject, observer } from 'mobx-react';

import SelectCards from "../Cards/SelectCards";
import Cards from "../Cards/Cards";
import ViewCard from "../Cards/ViewCard";

class Suggestion extends React.Component {
    messages = {
        C: ' is currently choosing a card.',
        V: ' is currently viewing a card.',
        N: ' was unable to provide a card.'
    }

    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
        this.state = {
            selected: null,
        }
    }

    getStatus() {
        let curr = this.store.getCurrentPlayer().id;
        let sug = this.store.getSuggestionPlayer().id;
        let mode = this.store.suggestion.mode;
        if (mode === 'C') {
            return `${curr}${this.messages.C}`
        } else if (mode === 'V') {
            return `${sug}${this.messages.V}`
        } else if (mode === 'N') {
            return `${curr}${this.messages.N}`
        }
    }

    render() {
        let playerCards = this.store.getPlayerCards();
        let suggestionCards = this.store.getSuggestionCards();
        let counterCard = this.store.getCounterCard();
        let sug = this.store.getSuggestionPlayer();
        let player = this.store.getCurrentPlayer();
        let mode = this.store.suggestion.mode;
        let status = this.getStatus();
        
        let content;
        if (mode === 'C') {
            content = (
                <SelectCards cards={playerCards} suggestion={suggestionCards}/>
            );
        } else if (mode === 'V') {
            content = (
                <ViewCard card={counterCard} player={player}/>
            )
        } else {
            content = (
                <div className='status'>
                     <span>{status}</span>
                </div>);
        }
        
        return (
            <div id="suggestion" className="board">
                <div className="suggestion-cards">
                    <h1 className="cards-header">
                        <span className={`header-${sug.color}`}>{sug.id}</span> has suggested:
                    </h1>
                    <div className="suggestion-items">
                        <Cards cards={suggestionCards}/>        
                    </div>
                </div>
                <div className="player-cards">
                    {content}
                </div>
            </div>
        )
    }
} export default inject('store') (observer(Suggestion));
