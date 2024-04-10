import React from "react";
import { inject, observer } from 'mobx-react';

class Lobby extends React.Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.appStore;
        this.state = {
            color: null,
            name: '',
            confirmed: false,
        }
    }

    confirmPlayer() {
        let name = this.state.name;
        let color = this.state.color;
        if (name.length && color) {
            if (this.store.validatePlayer(name)) {
                this.store.addPlayer(name, color);
                this.setState({confirmed: true});
            } else {
                alert(`Username ${name} is already taken!`);
            }
        } else {
            alert("Please select a username and character!");
        }
    }

    startGame() {
        this.store.startGame();
    }

    selectPlayer(color) {
        this.setState({color: color});
    }

    updateName(event) {
        let name = event.target.value;
        this.setState({name: name});
    }

    getColors() {
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
        for (const[id, player] of Object.entries(this.store.players)) {
            let idx = colors.indexOf(player.color);
            colors.splice(idx, 1);
        }
        return colors;
    }

    render() {
        let colors = this.getColors();
        let colorItems = [];
        for (let color of colors) {
            let active = (this.state.color === null ) || (this.state.color === color);
            let clazz = `color-item player-${color}`
            if (!active) {
                clazz += ' color-item-not-selected'
            } 
            colorItems.push(
                <div className={clazz} onClick={() => this.selectPlayer(color)}/>
            );
        }

        let playerItems = [];
        for (const[id, player] of Object.entries(this.store.players)) {
            playerItems.push(
                <div className='player-info'>
                    <div className={`player player-${player.color}`}/>
                    <div className='player-name'>{player.id}</div>
                </div>
            )
        }

        let content;
        if (!this.state.confirmed) {
            content = (
                <div className='create-player'>
                    <div className="username-input">
                        <input class='username-text' key="username" type="text" 
                        placeholder="username" onChange={(event) => this.updateName(event)}/>
                    </div>
                    <div className="select-color">
                        <h1 className='lobby-header'>Choose Your Character!</h1>
                        <div className='colors'>
                            {colorItems}
                        </div>
                    </div>
                    <div className="confirm-area">
                        <div className="action" id='confirm-button' onClick={() => this.confirmPlayer()}>Confirm</div>
                    </div>
                </div>
            );
        } else {
            content = (
                <div className='create-player'>
                    <div className="select-color">
                        <h1 className='lobby-header'>Waiting for Other Players...</h1>
                    </div>
                    <div className="confirm-area">
                        <div className="action" id='confirm-button' onClick={() => this.startGame()}>Start Game</div>
                    </div>
                </div>
            );
        }

        return (
            <div id='lobby' className='board'>
                <div className='lobby-players'>
                    <h1 className='lobby-header' id='players-header'>Players</h1>
                    <div className='players-list'>
                        {playerItems}
                    </div>
                </div>
               {content}
            </div>
        )
    }
} export default inject('store') (observer(Lobby));
