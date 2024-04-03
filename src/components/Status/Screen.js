import React from "react";
import { inject, observer } from 'mobx-react';


class Screen extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
    }

    render() {

        return (
            <div id='screen' className='board'>
                <div>
                    Game Over!
                </div>
            </div>
        )
    }
} export default inject('store') (observer(Screen));
