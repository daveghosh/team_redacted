import React from "react";
import { inject, observer } from 'mobx-react';

import Movement from "./Movement/Movement";
import Suggestion from "./Suggestion/Suggestion";
import Screen from "./Status/Screen";
import Lobby from "./Lobby/Lobby";
import Debug from "./Status/Debug";


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
        this.store.syncData();
    }

    render() {
        const safeState = this.store.isValidState();
        let mode = this.store.getGameMode();
        if (!safeState) {
            mode = 'debug';
        }
        return (
            <>
                {mode === 'lobby'? <Lobby/> : null}  
                {mode === 'board'? <Movement/> : null}
                {mode === 'suggestion'? <Suggestion/> : null}
                {mode === 'done'? <Screen/> : null}
                {mode === 'debug'? <Debug/> : null}
            </>
        )
    }
} export default inject('store') (observer(Board));
