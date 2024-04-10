import React from "react";
import { inject, observer } from 'mobx-react';

import Cards from "./Cards";

class ViewCard extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
    }

    acknowledgeCard() {
        this.store.acknowledgeCard();
    }

    render() {
        let cards = [this.props.card];
        let player = this.props.player;

        return (
            <div className='view-card'>
                <h1 className="cards-header" id='counter-header'>
                    <span className={`header-${player.color}`}>{player.id}</span> has countered:
                </h1>
                <div className="counter-card">
                    <Cards size='large' cards={cards}/>        
                </div>
                <div className='submit-area'>
                <div className="action" id="okay-button" onClick={() => this.acknowledgeCard()}>
                    Okay
                </div>
            </div>
            </div>
        )
    }
} export default inject('store') (observer(ViewCard));
