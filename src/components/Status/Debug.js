import React from "react";
import { inject, observer } from 'mobx-react';

class Debug extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
    }

    newGame() {
        this.store.newGame();
    }

    render() {
        return (
            <div id='screen' className='board'>
                <h1>
                    If you're reading this, something went wrong!
                </h1>
                <div className="replay-area">
                        <div className="action" id='replay-button' onClick={() => this.newGame()}>Reset</div>
                    </div>
            </div>
        )
    }
} export default inject('store') (observer(Debug));
