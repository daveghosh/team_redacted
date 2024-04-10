import { makeAutoObservable } from 'mobx';

export default class App {

  turn = 0;
  order = [];
  players = {};
  solution = [];
  mode = 'lobby'

  suggestion = {
    player: '',
    cards: [],
    counter: '',
    mode: ''
  }

  locations = {
    // top rooms
    room1:  { type: 'room', name: 'ballroom', align: 'none', adj: ["hall1", "hall3"]},
    hall1:  { type: 'hall', align: 'horizontal', adj: ["room1", "room2"]},
    room2:  { type: 'room', name: 'billiard room', align: 'none', adj: ["hall1", "hall2", "hall4"]},
    hall2:  { type: 'hall', align: 'horizontal', adj: ["room2", "room3"]},
    room3:  { type: 'room', name: 'conservatory', align: 'none', adj: ["hall2", "hall5"]},

    // top to middle hallways
    hall3:  { type: 'hall', align: 'vertical', adj: ["room1", "room4"]},
    space1: { type: '', align: '', adj: []},
    hall4:  { type: 'hall', align: 'vertical', adj: ["room2", "room5"]},
    space2: { type: '', align: '', adj: []},
    hall5:  { type: 'hall', align: 'vertical', adj: ["room3", "room6"]},

    // middle rooms
    room4:  { type: 'room', name: 'dining room', align: 'none', adj: ["hall3", "hall6", "hall8"]},
    hall6:  { type: 'hall', align: 'horizontal', adj: ["room4", "room5"]},
    room5:  { type: 'room', name: 'hall', align: 'none', adj: ["hall4", "hall6", "hall7", "hall9"]},
    hall7:  { type: 'hall', align: 'horizontal', adj: ["room5", "room6"]},
    room6:  { type: 'room', name: 'kitchen', align: 'none', adj: ["hall5", "hall7", "hall10"]},
    hall8:  { type: 'hall', align: 'vertical', adj: ["room4", "room7"]},

    // midle to bottom hallways
    space3: { type: '', align: '', adj: []},
    hall9:  { type: 'hall', align: 'vertical', adj: ["room5", "room8"]},
    space4: { type: '', align: '', adj: []},
    hall10: { type: 'hall', align: 'vertical', adj: ["room6", "room9"]},

    // bottom rooms
    room7:  { type: 'room', name: 'library', align: 'none', adj: ["hall8", "hall11"]},
    hall11: { type: 'hall', align: 'horizontal', adj: ["room7", "room8"]},
    room8:  { type: 'room', name: 'lounge', align: 'none', adj: ["hall9", "hall11", "hall12"]},
    hall12: { type: 'hall', align: 'horizontal', adj: ["room8", "room9"]},
    room9:  { type: 'room', name: 'study', align: 'none', adj: ["hall10", "hall12"]},
  }

  cards =  {
    // people
    card1:  { type: 'person', name: 'red'},
    card2:  { type: 'person', name: 'orange'},
    card3:  { type: 'person', name: 'yellow'},
    card4:  { type: 'person', name: 'green'},
    card5:  { type: 'person', name: 'blue'},
    card6:  { type: 'person', name: 'purple'},

    // weapons
    card7:  { type: 'weapon', name: 'revolver'},
    card8:  { type: 'weapon', name: 'dagger'},
    card9:  { type: 'weapon', name: 'lead pipe'},
    card10: { type: 'weapon', name: 'rope'},
    card11: { type: 'weapon', name: 'candlestick'},
    card12: { type: 'weapon', name: 'wrench'},

    // rooms
    card13: { type: 'room',   name: 'ballroom'},
    card14: { type: 'room',   name: 'billiard room'},
    card15: { type: 'room',   name: 'conservatory'},
    card16: { type: 'room',   name: 'dining room'},
    card17: { type: 'room',   name: 'hall'},
    card18: { type: 'room',   name: 'kitchen'},
    card19: { type: 'room',   name: 'library'},
    card20: { type: 'room',   name: 'lounge'},
    card21: { type: 'room',   name: 'study'},

    card22: {type: 'none', name: 'none'}
  }
  
  constructor() {
    makeAutoObservable(this, { autoBind: true });

    this.order = ["player1", "player2"];
    this.players = {
      player1: {
          id: 'player1',
          loc: 'room1',
          color: 'red',
          cards: ['card2', 'card8', 'card14']
      },
      player2: {
          id: 'player2',
          loc: 'room2',
          color: 'blue',
          cards: ['card3', 'card9', 'card15']
      },
    }
    this.solution = ['card1', 'card7', 'card17']
  }

  getNextRoom() {
    let size = this.order.length;
    return `room${size+1}`
  }

  validatePlayer(id) {
    return !(this.order.includes(id));
  }

  addPlayer(id, color) {
    let loc = this.getNextRoom();
    let player = {
      id: id,
      loc: loc,
      color: color,
      cards: ['card3', 'card9', 'card15']
    }
    this.players[id] = player;
    this.order.push(id);
  }

  setMode(mode) {
    this.mode = mode;
  }

  startGame() {
    this.setMode('board');
  }

  getMode() {
    return this.mode;
  }

  updateTurn() {
    let turn = this.turn;
    turn += 1;
    turn = turn % this.order.length;
    this.turn = turn;
  }

  setLocation(loc) {
    if (this.isAdjacent(loc)) {
        let players = this.players;
        let id = this.order[this.turn];
        let player = this.getCurrentPlayer();
        player.loc = loc;
        players[id] = player;
        this.players = players;
        this.updateTurn();
    }
  }

  getCardByName(name) {
    let cardId;
      for (const[id, card] of Object.entries(this.cards)) {
          if (card.name === name) {
              cardId = id;
          }
      }
      return cardId;
  }

  inRoom() {
    let player = this.getCurrentPlayer();
    let loc = this.locations[player.loc];
    return loc.type === 'room';
  }

  getCurrentPlayer() {
    let playerId = this.order[this.turn];
    return this.players[playerId];
  }

  getPlayerCards() {
    let player = this.getCurrentPlayer();
    let cards = [];
    for (let card of player.cards) {
      cards.push(this.cards[card]);
    }
    return cards;
  }

  getSuggestionCards() {
    let cards = [];
    let suggestion = this.suggestion;
    if (suggestion.cards) {
      for (let card of suggestion.cards) {
        cards.push(this.cards[card]);
      }
    }
    return cards;
  }

  getCounterCard() {
    let card;
    if (this.suggestion.counter) {
      card = this.cards[this.suggestion.counter];
    }
    return card;
  }

  getSuggestionPlayer() {
    let player;
    let suggestion = this.suggestion;
    if (suggestion) {
      let id = suggestion.player;
      player = this.players[id];
    }
    return player;
  }

  getPlayersAt(loc) {
      let players = [];
      for (const[player, value] of Object.entries(this.players)) {
          if (value.loc === loc) {
              players.push(value);
          }
      }
      return players;
  }

  isAdjacent(loc) {
      let player = this.getCurrentPlayer();
      let curr = this.locations[player.loc];
      return curr.adj.includes(loc);
  }

  startSuggestion() {
    console.log("Begin Suggestion Mode");
    this.suggestion.player = this.getCurrentPlayer().id;
    this.suggestion.mode = 'S';
    this.setMode('suggestion');
  }

  validateAccusation() {
    let cards = this.suggestion.cards;
    let correct = true;

    for (let card of cards) {
      if (!this.solution.includes(card)) {
        correct = false;
      }
    }
    if (correct) {
      this.suggestion.mode = 'W';
    } else {
      this.suggestion.mode = 'F';
    }
  }

  startAccusation() {
    console.log("Begin Accusation Mode");
    let player = this.getCurrentPlayer();
    this.suggestion.player = player.id;
    this.suggestion.mode = 'A';
    this.setMode('suggestion');
    // this.updateTurn();
    // this.suggestion.cards = ['card1', 'card7']
    // let loc = this.getCardByName(this.locations[player.loc].name);
    // this.suggestion.cards.push(loc);
    // this.validateAccusation();
    // this.setMode('suggestion');
  }

  getOrder(name) {
    let player = -1;
    for (let p = 0; p < this.order.length; p++) {
      if (this.order[p] === name) {
        return p;
      }
    }
    return player;
  }

  endSuggestion() {
    this.setMode('board');
    this.turn = this.getOrder(this.suggestion.player);
    this.updateTurn();
  }

  removePlayer() {
    let players = [];
    let player = this.getSuggestionPlayer();
    player.loc = 'nowhere';
    let curr = player.id;
    for (let player of this.order) {
      if (player !== curr) {
        players.push(player);
      }
    }
    this.order = players;
    if (players.length === 0) {
      this.setMode('done');
      console.log("You all lost!");
    }
  }

  acknowledgeAccusation() {
    if (this.suggestion.mode === 'W') {
      console.log("Game over!!");
      this.setMode('done');
    } else {
      this.setMode('board');
      this.removePlayer();
    }
    this.updateTurn();
  }

  acknowledgeCard() {
    if (this.suggestion.counter === 'card22') {
      let turn = this.turn;
      let player = this.suggestion.player;
      turn += 1;
      turn = turn % this.order.length;
      this.suggestion.mode = 'C';
      if (this.order[turn] !== player) {
        this.turn = turn;
      } else {
        this.endSuggestion();
      }
    } else {
      this.endSuggestion();
    }
  }

  getPlayerByColor(color) {
    let player;
    for (const[id, player] of Object.entries(this.players)) {
      if (player.color === color) {
        player = id;
      }
    }
    return player;
  }

  getRoomByName(name) {
    let room;
    for (const[id, room] of Object.entries(this.locations)) {
      if (room.name === name) {
        room = id;
      }
    }
    return room;
  }

  movePlayer(cards) {
    let location;
    let player;
    for (let card of cards) {
      if (card.type === 'person') {
        player = this.getPlayerByColor(card.name);
      } else if (card.type === 'room') {
        location = this.getRoomByName(card.name);
      }
    }
    if (player && location) {
      this.players[player].loc = location;
    }
  }

  submitSuggestion(cards) {
    let ids = cards.map(card => this.getCardByName(card));
    this.suggestion.cards = ids;
    if (this.suggestion.mode === 'S') {
      this.movePlayer(cards);
      this.suggestion.mode = 'C';
      this.updateTurn();
    } else if (this.suggestion.mode === 'A') {
      this.validateAccusation();
    }
  }
  
  submitCard(name) {
    let card = this.getCardByName(name);
    this.suggestion.counter = card;
    this.suggestion.mode = 'V';
  }
}
