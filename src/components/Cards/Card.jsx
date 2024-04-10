import React from "react";

export default class Card extends React.Component {

    render() {
        return (
            <div className='card' id={this.props.id}>
                <p className="card-label">
                    {this.props.name}
                </p>
            </div>
        );
    }
};
