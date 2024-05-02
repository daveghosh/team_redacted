import React from "react";
import Player from "./Player";
import Weapon from "./Weapon";

export default class Room extends React.Component {

    render() {
        let players = [];
        for (const[p, value] of Object.entries(this.props.players)) {
            let curr = (value === this.props.current);
            players.push(<Player key={`player${p+1}`} color={value.color} current={curr}/>);
        }

        let weapons = [];
        for (const[w, value] of Object.entries(this.props.weapons)) {
            weapons.push(<Weapon key={`weapon${w+1}`} name={value.name}/>);
        }

        let classname = "room";
        if (this.props.open) {
            classname += " room-active";
        }

        return (
            <div className={classname} onClick={this.props.setLocation}>
                <div className='room-label'>
                    {this.props.name}
                </div>
                <div className="players">
                    {players}
                    {weapons}
                </div>
            </div>
        )
    }
};
