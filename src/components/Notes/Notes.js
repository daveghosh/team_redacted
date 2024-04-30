import React from "react";
import { inject, observer } from 'mobx-react';


class Notes extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
    }

    updateNote(note) {
        this.store.updateNote(note);
    }

    getSymbol(note) {
        const value = this.store.getNote(note);
        let symbol = "";
        if (value === 1) {
            return "X";
        } else if (value === -1) {
            return "✓";
        }
        return symbol;
    }


    render() {
        const suspects = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
        const rooms = ['ballroom', 'billiard', 'conserv.', 'dining',
                       'hall', 'kitchen', 'library', 'lounge', 'study'];
        const weapons = ['revolver', 'dagger', 'lead pipe', 'rope', 'candlest.']
        let suspectItems = [];
        let weaponItems = [];
        let roomItems = [];

        for (const suspect of suspects) {
            const symbol = this.getSymbol(suspect);
            suspectItems.push(
            <div className="note-row">
                <div className="note-name">{suspect}</div>
                <div className='note-boxes'>
                    <div className='note-box active-box' onClick={() => this.updateNote(suspect)}>{symbol}</div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                </div>
            </div>
            );
        }

        for (const weapon of weapons) {
            const symbol = this.getSymbol(weapon);
            weaponItems.push(
            <div className="note-row">
                <div className="note-name">{weapon}</div>
                <div className='note-boxes'>
                    <div className='note-box active-box' onClick={() => this.updateNote(weapon)}>{symbol}</div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                </div>
            </div>
            );
        }

        for (const room of rooms) {
            const symbol = this.getSymbol(room);
            roomItems.push(
            <div className="note-row">
                <div className="note-name">{room}</div>
                <div className='note-boxes'>
                <div className='note-box active-box' onClick={() => this.updateNote(room)}>{symbol}</div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                    <div className='note-box'></div>
                </div>
            </div>
            );
        }


        return (
            <div className="notes">
            <h1 className="notes-header">Clues</h1>
            <div className="notepad">
                <div>
                    <div className='note-section'>
                        <h2 className="notes-section-header">Suspects</h2>
                        {suspectItems}
                    </div>
                    <div className='note-section'>
                        <h2 className="notes-section-header">Weapons</h2>
                        {weaponItems}
                    </div>
                    <div className='note-section'>
                        <h2 className="notes-section-header">Rooms</h2>
                        {roomItems}
                    </div>
                </div>
            </div>
            </div>
        )
    }
} export default inject('store') (observer(Notes));
