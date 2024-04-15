import { makeAutoObservable } from 'mobx';
import axios from 'axios';

export default class App {

  host = 'https://clueless-backend.netlify.app/.netlify/functions/server';

  turn = 0;
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

  // weapons = {
  //   weapon1:  { name: 'revolver', loc: 'room1'},
  //   weapon2:  { name: 'dagger', loc: 'room2'},
  //   weapon3:  { name: 'lead pipe', loc: 'room3'},
  //   weapon4:  { name: 'rope', loc: 'room4'},
  //   weapon5:  { name: 'candlestick', loc: 'room5'},
  //   weapon6:  { name: 'wrench', loc: 'room6'},
  // }
  weapons = {}

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
    this.solution = []
  }

  synchronizeStore() {
    this.updateGame();
    this.updatePlayers();
    this.updateCards();
    this.updateWeapons();
    this.updateSolution();
    let mode = this.getMode();
    if (mode === 'suggestion') {
      this.updateSuggestion();
    }
  }

  updateGame() {
    axios.get(`${this.host}/games`).then((data) => {
      const game = data.data[0];
      this.mode = game.mode;
      this.turn = game.turn;
      return game;
    })
    .catch(function (error) {
      console.error(error);
    });
  }


  getMode() {
    return this.mode;
    // axios.get(`${this.host}/games`).then((data) => {
    //   const game = data.data[0];
    //   return game.mode;
    // })
  }

  getTurn() {
    return this.turn;
    // axios.get(`${this.host}/games`).then((data) => {
    //   const game = data.data[0];
    //   return game.turn;
    // })
  }

  resetGame() {
    axios.post(`${this.host}/resetGame`)
    .catch(function (error) {
      console.error(error);
    });
    axios.post(`${this.host}/resetCards`)
    .catch(function (error) {
      console.error(error);
    });
    // axios.post(`${this.host}/resetPlayers`);
  }

  resetWeapons() {
    let locs = {
    weapon1:  'room1',
    weapon3:  'room3',
    weapon2:  'room2',
    weapon4:  'room4',
    weapon5:  'room5',
    weapon6:  'room6'
    }
  for (const [weapon, loc] of Object.entries(locs))
    axios.post(`${this.host}/updateLocation/weapon/${weapon}/${loc}`)
    .catch(function (error) {
      console.error(error);
    });
  }

  getSolution() {
    return this.solution;
  }

  updateSolution() {
    axios.get(`${this.host}/solution`).then((data) => {
      let solution = data.data[0];
      this.solution = [solution.weapon, solution.room, solution.person];
      return solution;
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  getSuggestion() {
    return this.suggestion;
  }

  updateSuggestion() {
    axios.get(`${this.host}/suggestion`).then((data) => {
      let suggestion = data.data[0];
      this.suggestion = {
        player: suggestion.player,
        cards: [suggestion.weapon, suggestion.room, suggestion.person],
        counter: suggestion.counter,
        mode: suggestion.mode
      }
      return suggestion;
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  getPlayers() {
    return Object.values(this.players);
  }

  updatePlayers() {
    axios.get(`${this.host}/players`).then((data) => {
      const players = data.data;
    for (let playerData of players) {
      let id = playerData.id;
      let cards = this.getCardsByPlayer(id);
      let player = {
        id: playerData.id,
        loc: playerData.loc,
        cards: cards,
        color: playerData.color,
        canSuggest: playerData.cansuggest,
        canMove: playerData.canmove,
      }
      this.players[id] = player;
    }
      return data.data;
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  getWeapons() {
    return Object.values(this.weapons);
  }

  updateWeapons() {
    let weapons = this.getWeapons();
    // only update this on start for now
    if (weapons.length === 0) {
      axios.get(`${this.host}/weapons`).then((data) => {
        const weapons = data.data;
        for (let weapon of weapons) {
          let id = weapon.id;
          let name = weapon.name;
          let loc = weapon.loc;
          this.weapons[id] = {name: name, loc: loc}
        }
        return weapons;
      })
      .catch(function (error) {
        console.error(error);
      });
    }
  }

  setCardPlayer(id, player) {
    const apiUrl = `${this.host}/card/${id}/${player}`
    axios.post(apiUrl)
    .then(response => {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  getCardsByPlayer(player) {
    if (player in this.players) {
      return this.players[player].cards;
    } else {
      return [];
    }
    // let cards = [];
    // for (const card of this.getCards()) {
    //   if (card.player_id === player) {
    //     cards.push(card);
    //   }
    // }
    // return cards;
    // const apiUrl = `${this.host}/cards/${player}`
    // axios.get(apiUrl)
    // .then((data) => {
    //   let cards = data.data;
    //   return cards;
    // })
  }

  getCards() {
    return Object.values(this.cards);
  }

  updateCards() {
    let players = this.getPlayers();
    if (players[0] && players[0].cards.length === 0) {
      axios.get(`${this.host}/cards`).then((data) => {
        const cards = data.data;
        for (let card of cards) {
          if (card.player_id) {
            this.players[card.player_id].cards.push(card);
          }
          // this.cards[card.id]['player_id'] = card.player_id;
        }
        return cards;
      })
      .catch(function (error) {
        console.error(error);
      });
    }
  }

  getSuggestion() {
    return this.suggestion;
  }

  getSuggestionMode() {
    return this.suggestion.mode;
  }

  updateSuggestion() {
    axios.get(`${this.host}/suggestion`).then((data) => {
      let suggestion = data.data[0];
      return suggestion;
    })
    .catch(function (error) {
      console.error(error);
    });
  }


  getRandomCard(cards) {
    let idx = Math.floor(Math.random() * cards.length);
    let card = cards[idx];
    cards.splice(idx, 1);
    return card;

  }

  assignCards() {
    let cardIds = Object.keys(this.cards);
    let rooms = cardIds.filter(id => this.cards[id].type === 'room');
    let persons = cardIds.filter(id => this.cards[id].type === 'person');
    let weapons = cardIds.filter(id => this.cards[id].type === 'weapon');

    let room = this.getRandomCard(rooms);
    let person = this.getRandomCard(persons);
    let weapon = this.getRandomCard(weapons);
    this.solution = [person, weapon, room];

    let players = Object.keys(this.players);
    let i = 0;
    while (rooms.length > 0) {
      let playerId = players[i];
      room = this.getRandomCard(rooms);
      this.setCardPlayer(room, playerId);
      i++;
      if (i >= players.length) {
        i = 0;
      }
    }

    while (weapons.length > 0) {
      let playerId = players[i];
      weapon = this.getRandomCard(weapons);
      this.setCardPlayer(weapon, playerId);
      i++;
      if (i >= players.length) {
        i = 0;
      }
    }

    while (persons.length > 0) {
      let playerId = players[i];
      person = this.getRandomCard(persons);
      this.setCardPlayer(person, playerId);
      i++;
      if (i >= players.length) {
        i = 0;
      }
    }
  }

  getNextRoom() {
    let size = Object.keys(this.players).length;
    return `room${size+1}`
  }

  validatePlayer(id) {
    let ids = Object.keys(this.players);
    return !(ids.includes(id));
  }

  addPlayer(id, color) {
    let loc = this.getNextRoom();
    const apiUrl = `${this.host}/player/${id}/${loc}/${color}`
    axios.post(apiUrl)
    .then(response => {
      console.log(response.data);
      let player = {
        id: id,
        loc: loc,
        cards: [],
        color: color,
        canSuggest: false,
        canMove: true,
      }
      this.players[id] = player;
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  setMode(mode) {
    const apiUrl = `${this.host}/gameMode/${mode}`
    axios.post(apiUrl)
    .catch(function (error) {
      console.error(error);
    });
  }

  setSuggestionMode(mode) {
    const apiUrl = `${this.host}/suggestionMode/${mode}`
    axios.post(apiUrl)
    .catch(function (error) {
      console.error(error);
    });
  }

  setSuggestion(cards) {
    let weapon;
    let room;
    let person;
    for (const card of cards) {
      let cardObj = this.cards[card];
      if (cardObj.type === 'weapon') {
        weapon = card;
      } else if (cardObj.type === 'room') {
        room = card;
      } else if (cardObj.type === 'person') {
        room = card;
      }
    }
    if (weapon && room && person) {
      const apiUrl = `${this.host}/suggestion/${weapon}:/${room}/${person}`
      axios.post(apiUrl)
      .catch(function (error) {
        console.error(error);
      });
    }
  }

  setSuggestionPlayer(player) {
    const apiUrl = `${this.host}/suggest/${player}`
    axios.post(apiUrl)
    .catch(function (error) {
      console.error(error);
    });
  }

  setCounterCard(card) {
    const apiUrl = `${this.host}/counter/${card}`
    axios.post(apiUrl)
    .catch(function (error) {
      console.error(error);
    });
  }

  startGame() {
    // this.assignCards();
    this.resetWeapons();
    this.setMode('board');
  }

  newGame() {
    this.resetGame();
  }

  updateTurn() {
    let player;
    let players = this.getPlayers();
    let turn = this.getTurn();
    let canMove = false;
    let i = 0;
    while (!canMove) {
      turn += 1;
      i += 0;
      turn = turn % players.length;
      player = players[turn];
      // canMove = player.canMove;
      canMove = true;
      console.log("Player=", player)
    }
    console.log("Updating turn to=", turn)
    this.setTurn(turn);
  }

  setTurn(turn) {
    const apiUrl = `${this.host}/turn/${turn}`
    axios.post(apiUrl)
    .then(response => {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  updateSuggestionTurn() {
    let player;
    let players = this.getPlayers();
    let turn = this.getTurn();
    turn += 1;
    turn = turn % players.length;
    player = players[turn];
    this.setTurn(turn);
  }

  movePlayer(playerId, loc) {
    const apiUrl = `${this.host}/updateLocation/player/${playerId}/${loc}`
    axios.post(apiUrl)
    .then(response => {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  moveWeapon(weaponId, loc) {
    const apiUrl = `${this.host}/updateLocation/weapon/${weaponId}/${loc}`
    axios.post(apiUrl)
    .then(response => {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  setCanSuggest(playerId, canSuggest) {
    const apiUrl = `${this.host}/canSuggest/${playerId}/${canSuggest}`
    axios.post(apiUrl)
    .then(response => {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  setCanMove(playerId, canMove) {
    const apiUrl = `${this.host}/canMove/${playerId}/${canMove}`
    axios.post(apiUrl)
    .then(response => {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  setLocation(loc) {
    if (this.isAdjacent(loc)) {
      let player = this.getCurrentPlayer();
      this.movePlayer(player.id, loc);
      this.setCanSuggest(player.id, true);
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
    if (player) {
      let loc = this.locations[player.loc];
      return loc.type === 'room';
    }
    return false;
  }

  getCurrentPlayer() {
    let players = this.getPlayers();
    let turn = this.getTurn();
    let player = players[turn];
    return player;
  }

  getCurrentSuggestionPlayer() {
    let players = this.getPlayers();
    let turn = this.getTurn();
    let player = players[turn];
    return player
  }

  getSuggestionPlayerCards() {
    let player = this.getCurrentSuggestionPlayer();
    let cards = [];
    if (player) {
      let cardData = this.getCardsByPlayer(player.id);
      for (let card of cardData) {
        cards.push(this.cards[card]);
      }
    }
    return cards;
  }

  getPlayerCards() {
    let cards = [];
    let player = this.getCurrentPlayer();
    if (player) {
      let playerCards = this.getCardsByPlayer(player.id);
      if (playerCards) {
        cards = playerCards;
      }
    }
    return cards;
  }

  getSuggestionCards() {
    let cards = [];
    let suggestion = this.getSuggestion();
    if (suggestion.cards) {
      for (let card of suggestion.cards) {
        cards.push(this.cards[card]);
      }
    }
    return cards;
  }

  getCounterCard() {
    let card;
    let suggestion = this.getSuggestion();
    if (suggestion.counter) {
      card = this.cards[suggestion.counter];
    }
    return card;
  }

  getSuggestionPlayer() {
    let player;
    let suggestion = this.getSuggestion();
    if (suggestion) {
      let id = suggestion.player;
      player = this.players[id];
    }
    return player;
  }

  getPlayersAt(loc) {
      let players = [];
      let playerData = this.getPlayers();
      for (const player of playerData) {
          if (player.loc === loc) {
              players.push(player);
          }
      }
      return players;
  }

  getWeaponsAt(loc) {
    let weapons = [];
    let weaponData = this.getWeapons();
    for (const weapon of weaponData) {
        if (weapon.loc === loc) {
            weapons.push(weapon);
        }
    }
    return weapons;
}

  isAdjacent(loc) {
      let player = this.getCurrentPlayer();
      if (player) {
        let curr = this.locations[player.loc];
        return curr.adj.includes(loc);
      }
      return false;
  }

  startSuggestion() {
    let player = this.getCurrentPlayer().id;
    this.setSuggestionPlayer(player);
    this.setSuggestionMode('S');
    this.setMode('suggestion');
  }

  validateAccusation() {
    let cards = this.getSuggestionCards();
    let correct = true;

    for (let card of cards) {
      if (!this.solution.includes(card)) {
        correct = false;
      }
    }
    if (correct) {
      this.setSuggestionMode('W');
    } else {
      this.setSuggestionMode('F');
    }
  }

  startAccusation() {
    let player = this.getCurrentPlayer().id;
    this.setSuggestionPlayer(player);
    this.setSuggestionMode('A');
    this.setMode('suggestion');
  }

  getOrder(name) {
    let players = this.getPlayers();
    for (let p in players) {
      if (players[p].name === name) {
        return p;
      }
    }
    return -1;
  }

  endSuggestion() {
    this.setMode('board');
    this.turn = this.getOrder(this.suggestion.player);
    this.updateTurn();
  }

  removePlayer() {
    let player = this.getSuggestionPlayer();
    this.setCanMove(player.id, false);
    let players = this.getPlayers();
    let inGame = players.filter( player => player.canMove);
    if (inGame.length === 0) {
      this.setMode('done');
    }
  }

  acknowledgeAccusation() {
    if (this.suggestion.mode === 'W') {
      this.setMode('done');
    } else {
      this.setMode('board');
      this.removePlayer();
    }
    let players = this.getPlayers();
    let turn = this.getTurn() %players.length;
    this.setTurn(turn);
  }

  acknowledgeCard() {
    let suggestion = this.getSuggestion();
    if (suggestion.counter === 'card22') {
      this.updateSuggestionTurn();
      this.setSuggestionMode('C');
      let current = this.getCurrentPlayer();
      let suggestionPlayer = this.getSuggestionPlayer();
      if (current === suggestionPlayer) {
        this.endSuggestion();
      }
    } else {
      this.endSuggestion();
    }
  }

  getPlayerByColor(color) {
    let players = this.getPlayers();
    for (const player of players) {
      if (player.value === color) {
        return player.id;
      }
    }
    return;
  }

  getRoomByName(name) {
    let room;
    for (const[id, value] of Object.entries(this.locations)) {
      if (value.name === name) {
        room = id;
      }
    }
    return room;
  }

  getWeaponByName(name) {
    let weapons = this.getWeapons();
    for (const weapon of weapons) {
      if (weapon.name === name) {
        return weapon.id;
      }
    }
    return;
  }

  moveCards(cards) {
    let location;
    let player;
    let weapon;
    for (let name of cards) {
      let id = this.getCardByName(name);
      let card = this.cards[id];
      if (card.type === 'person') {
        player = this.getPlayerByColor(name);
      } else if (card.type === 'room') {
        location = this.getRoomByName(name);
      } else if (card.type === 'weapon') {
        weapon = this.getWeaponByName(name);
      }
    }
    if (player && location) {
      this.movePlayer(player, location);
      this.setCanSuggest(player, true);
    }
    if (weapon && location) {
      this.moveWeapon(weapon, location);
    }
  }

  submitSuggestion(cards) {
    let ids = cards.map(card => this.getCardByName(card));
    let player = this.getCurrentPlayer();
    this.setCanSuggest(player.id, false);
    this.setSuggestion(player.id, ids);
    let mode = this.getSuggestion().mode;
    if (mode === 'S') {
      this.moveCards(cards);
      this.setSuggestionMode('C');
      this.updateSuggestionTurn();
    } else if (mode === 'A') {
      this.validateAccusation();
    }
  }
  
  submitCard(name) {
    let card = this.getCardByName(name);
    this.setCounterCard(card);
    this.setSuggestionMode('V');
    this.setCounterCard(card);
  }
}
