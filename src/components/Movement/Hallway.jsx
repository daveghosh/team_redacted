import React from "react";
import Player from "../Player";

export default class Hallway extends React.Component {

    render() {
        let classname = "";
        if (this.props.align) {
            classname += this.props.align;
        }
        if (this.props.isAdjacent) {
            classname += " hallway-active";
        }

        let players = [];
        for (const[p, value] of Object.entries(this.props.players)) {
            let curr = (value === this.props.current);
            players.push(<Player key={`player${p+1}`} color={value.color} current={curr}/>);
        }

        return (
            <div className={`hallway ${classname}`} onClick={this.props.setLocation}>
                {players}
            </div>
        )
    }
};
