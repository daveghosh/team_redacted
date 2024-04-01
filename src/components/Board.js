import React from "react";
import { inject, observer } from 'mobx-react';

import Movement from "./Movement/Movement";
import Suggestion from "./Suggestion/Suggestion";


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
    }

    render() {
        let mode = this.store.getMode();
        return (
            <>
                {mode === 'board'? <Movement/> : null}
                {mode === 'suggestion'? <Suggestion/> : null}
            </>
        )
    }
} export default inject('store') (observer(Board));
