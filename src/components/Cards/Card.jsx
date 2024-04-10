import React from "react";

export default class Card extends React.Component {

    render() {
        let clazz = 'card';
        if (this.props.size === 'small') {
            clazz += ' card-small';
        } else if (this.props.size === 'medium') {
            clazz += ' card-medium';
        } else if (this.props.size === 'large') {
            clazz += ' card-large';
        }

        return (
            <div className={clazz} id={this.props.id}>
                <p className="card-label">
                    {this.props.name}
                </p>
            </div>
        );
    }
};
