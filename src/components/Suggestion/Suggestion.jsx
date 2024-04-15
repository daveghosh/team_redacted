import React from "react";
import { inject, observer } from 'mobx-react';

import CounterCards from "../Cards/CounterCards";
import Cards from "../Cards/Cards";
import ViewCard from "../Cards/ViewCard";
import SelectCards from "../Cards/SelectCards";

class Suggestion extends React.Component {
    messages = {
        C: ' is currently choosing a card',
        V: ' is currently viewing a card',
        N: ' was unable to provide a card',
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
        let currPlayer = this.store.getCurrentSuggestionPlayer();
        let sugPlayer = this.store.getSuggestionPlayer();
        let curr;
        let sug;
        if (currPlayer) {
            curr = currPlayer.id;
        }
        if (sugPlayer) {
            sug = sugPlayer.id;
        }

        let mode = this.store.suggestion.mode;
        let status;
        if (mode === 'C') {
            status = `${curr}${this.messages.C}`
        } else if (mode === 'V') {
            status = `${sug}${this.messages.V}`
        } else if (mode === 'N') {
            status = `${curr}${this.messages.N}`
        } else {
            status = `${sug}${this.messages[mode]}`;
        }
        return status;
    }

    acknowledgeAccusation() {
        this.store.acknowledgeAccusation();
    }

    render() {
        let playerCards = this.store.getSuggestionPlayerCards();
        let suggestionCards = this.store.getSuggestionCards();
        let counterCard = this.store.getCounterCard();
        let sug = this.store.getSuggestionPlayer();
        let player = this.store.getCurrentSuggestionPlayer();
        let mode = this.store.getSuggestionMode();
        let status = this.getStatus();
        
        let content;
        let header;
        if (['S', 'A'].includes(mode)) {
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
            if (mode === 'C') {
                content = (
                    <CounterCards cards={playerCards} suggestion={suggestionCards}/>
                );
            } else if (mode === 'V') {
                content = (
                    <ViewCard card={counterCard} player={player}/>
                )
            } else if (['C', 'V', 'N'].includes(mode)){
                content = (
                    <span className="status">{status}</span>);
            } else if (['W', 'F'].includes(mode)) {
                content = (
                    <div className='accuse-status'>
                         <span className="status">{status}</span>
                         <div className="action" id="accuse-okay-button" onClick={() => this.acknowledgeAccusation()}>
                            Okay
                        </div>
                    </div>);
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
