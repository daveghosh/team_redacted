import React from "react";

export default class Card extends React.Component {

    render() {
        let setCard = () => {};
        if (this.props.setCard) {
            setCard = this.props.setCard;
        }
        let clazz = 'card';
        if (this.props.isSelected === -1 ) {
            clazz += ' non-selected-card';
        }

        return (
            <div className={clazz} id={this.props.id} onClick={setCard}>
                {this.props.name}
            </div>
        );
    }
};
