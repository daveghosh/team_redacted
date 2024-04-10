import React from "react";

export default class Card extends React.Component {

    render() {
        let setCard = () => {};
        let clazz = 'select-card';
        // if (this.props.isSelected === -1 ) {
        //     clazz += ' non-selected-card';
        // }
        if (!this.props.canSelect) {
            clazz += ' non-selected-card';
        } else {
            setCard = this.props.setCard;
        }
        
        if (this.props.isSelected === 1) {
            clazz += ' selected-card';
        }

        return (
            <div className={clazz} id={this.props.id} onClick={setCard}>
                {this.props.name}
            </div>
        );
    }
};
