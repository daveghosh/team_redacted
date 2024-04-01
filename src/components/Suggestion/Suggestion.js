import React from "react";
import { inject, observer } from 'mobx-react';

import SelectCard from "../Cards/SelectCard";
import Cards from "../Cards/Cards";

class Suggestion extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
        this.state = {
            selected: null,
        }
    }

    render() {
        let playerCards = this.store.getPlayerCards();
        let suggestionCards = this.store.getSuggestionCards();
        let player = this.store.getSuggestionPlayer();
        let color = this.store.players[player].color;
        return (
            <div key="suggestion" className="board">
                <div className="suggestion-cards">
                    <h1 className="cards-header">
                        <span className={`header-${color}`}>{player}</span> has suggested:
                    </h1>
                    <Cards cards={suggestionCards}/>
                </div>
                <div className="player-cards">
                    <SelectCard cards={playerCards}/>
                </div>
            </div>
        )
    }
} export default inject('store') (observer(Suggestion));
