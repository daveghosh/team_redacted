import React from "react";
import rope from './Rope.jpg'
import candlestick from './Candlestick.jpg'
import dagger from './Dagger.jpg'
import lead_pipe from './lead_pipe.jpg'
import revolver from './Revolver.jpg'
import wrench from './Wrench.jpg'

export default class Player extends React.Component {

    render() {
        let name = this.props.name.toUpperCase();

        let image = rope 
        let letter = name.charAt(0);

        if(name == 'REVOLVER'){
            image = revolver
        }
        if(name == 'CANDLESTICK'){
            image = candlestick
        }

        if(name == 'DAGGER'){
            image = dagger
        }
        if(name == "LEAD PIPE"){
            image = lead_pipe
        }
        if(name == 'WRENCH'){
            image = wrench
        }

        return (
            <div className='weapon'>
                <img src = {image} width = "40" height = "35" />
            </div>
        )
    }
};
