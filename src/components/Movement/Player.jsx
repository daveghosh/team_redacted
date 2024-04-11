import React from "react";

export default class Player extends React.Component {

    render() {
        let color = this.props.color;
        let classname = `player player-${color}`;
        if (this.props.current) {
            classname += " player-current";
        }
        return (
            <div className={classname}>

            </div>
        )
    }
};
