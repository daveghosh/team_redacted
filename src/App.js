import React from "react";

import { Provider } from 'mobx-react';
import { store } from "./stores/Stores";

import Board from './components/Board';

import './App.css';


function App() {
  return (
    <Provider store={store}>
      <div className="App">
      <Board/>
    </div>
    </Provider>
  )
}

export default App;
