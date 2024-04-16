import React from "react";
import { inject, observer } from 'mobx-react';

import Movement from "./Movement/Movement";
import Suggestion from "./Suggestion/Suggestion";
import Screen from "./Status/Screen";
import Lobby from "./Lobby/Lobby";


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
        // this.store.syncData();
    }

    componentDidMount() {
        setInterval( () => {
            this.store.syncData()
        }, 500);
    }

    render() {
        let mode = this.store.getGameMode();
        return (
            <>
                {mode === 'lobby'? <Lobby/> : null}  
                {mode === 'board'? <Movement/> : null}
                {mode === 'suggestion'? <Suggestion/> : null}
                {mode === 'done'? <Screen/> : null}
            </>
        )
    }
} export default inject('store') (observer(Board));
