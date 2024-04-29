import React from "react";
import { inject, observer } from 'mobx-react';

import CounterCards from "../Cards/CounterCards";
import Cards from "../Cards/Cards";
import ViewCard from "../Cards/ViewCard";
import SelectCards from "../Cards/SelectCards";

class Suggestion extends React.Component {
    messages = {
        S: ' is currently making a suggestion',
        A: ' is currently making an accusation',
        C: ' is currently choosing a counter card',
        N: ' was unable to submit a counter card',
        V: ' is currently viewing the counter card submitted by ',
        W: ' has made a correct accusation!',
        F: ' has made a false accusation',
    }

    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
        this.state = {
            selected: null,
        }
    }

    getStatus() {
        const curr = this.store.getCurrentPlayer();
        const sug = this.store.getSuggestionPlayer();
        const currId = curr? curr.id : '';
        const sugId = sug? sug.id : '';
        let mode = this.store.getSuggestionMode();
        let status;
        if (mode === 'C') {
            status = `${currId}${this.messages.C}`
        } else if (mode === 'V') {
            status = `${sugId}${this.messages.V}${currId}`
        } else if (mode === 'N') {
            status = `${currId}${this.messages.N}`
        } else {
            status = `${sugId}${this.messages[mode]}`;
        }
        return status;
    }

    acknowledgeAccusation() {
        this.store.acknowledgeAccusation();
    }

    render() {
        let playerCards = this.store.getPlayerCards();
        let suggestionCards = this.store.getSuggestionCards();
        let counterCard = this.store.getCounterCard();
        let sug = this.store.getSuggestionPlayer();
        let player = this.store.getCurrentPlayer();
        let mode = this.store.getSuggestionMode();
        let status = this.getStatus();
        
        let content;
        let header;

        const isActive = this.store.isActive();
        const isSugg = this.store.isSuggestionPlayer();

        // Active Player is Making a Suggestion
        if (['S', 'A'].includes(mode) && isActive) {
            content = (
                <SelectCards/>
            )

        } else {
            header = (
                <div className="suggestion-cards">
                    <h1 className="cards-header">
                        <span className={`header-${sug? sug.color : ''}`}>{sug? sug.id : ''}</span> has suggested:
                    </h1>
                    <div className="suggestion-items">
                        <Cards size='small' cards={suggestionCards}/>        
                    </div>
                </div>
            )

            // Active Player is Making a Counter Suggestion
            if (isActive && mode === 'C') {
                content = (
                    <CounterCards cards={playerCards} suggestion={suggestionCards}/>
                );
            // Suggesting Player is Viewing Counter Suggestion
            } else if (isSugg && (['V', 'N'].includes(mode))) {
                content = ( <ViewCard card={counterCard} player={player}/> );
            // Suggestion Player is Acknowledging Accusation Result
            } else if (isSugg && ['W', 'F'].includes(mode)) {
                content = (
                    <div className='accuse-status'>
                         <span className="status">{status}</span>
                         <div className="action" id="accuse-okay-button" onClick={() => this.acknowledgeAccusation()}>
                            Okay
                        </div>
                    </div>);
            } else if (['W', 'F'].includes(mode)) {
                content = (
                    <div className='accuse-status'>
                         <span className="status">{status}</span>
                    </div>);
            } else {
                header = null;
                content = ( <span className="status center-status">{status}</span> );
            }
        }
        
        return (
            <div id="suggestion" className="board">
                {header}
                <div className="player-cards">
                    {content}
                </div>
            </div>
        )
    }
} export default inject('store') (observer(Suggestion));
