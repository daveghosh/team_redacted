import React from "react";
import Player from "../Player";

export default class Room extends React.Component {

    render() {
        let players = [];
        for (const[p, value] of Object.entries(this.props.players)) {
            let curr = (value === this.props.current);
            players.push(<Player key={`player${p+1}`} color={value.color} current={curr}/>);
        }

        let classname = "room";
        if (this.props.isAdjacent) {
            classname += " room-active";
        }

        return (
            <div className={classname} onClick={this.props.setLocation}>
                <div className='room-label'>
                    {this.props.name}
                </div>
                <div className="players">
                    {players}
                </div>
            </div>
        )
    }
};
