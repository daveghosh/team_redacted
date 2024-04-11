import React from "react";

export default class Player extends React.Component {

    render() {
        let name = this.props.name.toUpperCase();
        let letter = name.charAt(0);
        return (
            <div className='weapon'>
                {name}
            </div>
        )
    }
};
