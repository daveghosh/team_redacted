import React from "react";
import { inject, observer } from 'mobx-react';

import Actions from "../Actions/Actions";
import Cards from "../Cards/Cards";
import Room from "./Room";
import Hallway from "./Hallway";


class Movement extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
    }

    render() {

        let locItems = [];
        let curr = this.store.getCurrentPlayer();
        let cards = this.store.getPlayerCards();
        for (const [locId, loc] of Object.entries(this.store.locations)) {
            let players = this.store.getPlayersAt(locId);
            let weapons = this.store.getWeaponsAt(locId);
            let adjacent = this.store.isAdjacent(curr, locId);
            let setLoc = () => this.store.setLocation(locId);
            if (loc.type === 'room') {
                locItems.push(<Room key={locId} name={loc.name} id={locId} players={players} weapons={weapons} isAdjacent={adjacent} setLocation={setLoc} current={curr}/>)
            } else if (loc.type === 'hall') {
                locItems.push(<Hallway key={locId} id={locId} align={loc.align} players={players} isAdjacent={adjacent} setLocation={setLoc} current={curr}/>)
            } else {
                locItems.push(<div key={locId}/>)
            }
        }

        return (
            <div key='movement' className='board'>
                <div className="cards-area">
                    <div className='board-cards'>
                        <Cards cards={cards}/>
                    </div>
                </div>
                <div key="locations" className="locations">
                    {locItems}
                </div>
                <Actions/>
            </div>
        )
    }
} export default inject('store') (observer(Movement));
