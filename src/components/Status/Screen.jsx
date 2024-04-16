import React from "react";
import { inject, observer } from 'mobx-react';

import Cards from "../Cards/Cards";


class Screen extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
    }

    newGame() {
        this.store.newGame();
    }

    render() {
        let cards = this.store.getSolution();
        return (
            <div id='screen' className='board'>
                <h1>
                    Game Over!
                </h1>
                <div className="solution">
                    <h1 className="screen-header">Solution:</h1>
                    <div className="solution-cards">
                        <Cards size="medium" cards={cards}/>
                    </div>
                </div>
                <div className="replay-area">
                        <div className="action" id='replay-button' onClick={() => this.newGame()}>Play Again</div>
                    </div>
            </div>
        )
    }
} export default inject('store') (observer(Screen));
