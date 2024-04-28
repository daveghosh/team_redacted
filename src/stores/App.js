import { makeAutoObservable } from 'mobx';
import { createClient } from '@supabase/supabase-js';


const PROJECT_URL = 'https://omdvfmknrfqpoeebpnfd.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZHZmbWtucmZxcG9lZWJwbmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxOTYwNjUsImV4cCI6MjAyODc3MjA2NX0.kfomW6iWicmLnvghJvegc1duqCFO0w7trFEIqEKZYvQ';
const supabase = createClient(PROJECT_URL, ANON_KEY);

export default class App {

  gameId = 1;
  session = null;
  turn = 0;
  mode = 'lobby'

  players = [];
  weapons = [];

  cards = [];
  solution = [];
  suggestion = {};

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

  channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
      },
      (payload) => {
        const data = payload.new;
        this.turn = data.turn;
        this.mode = data.mode;
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'suggestions',
      },
      (payload) => {
        const data = payload.new;
        this.suggestion = data;
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
      },
      (payload) => {
        this.syncPlayers();
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'weapons',
      },
      (payload) => {
        this.syncWeapons();
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'cards',
      },
      (payload) => {
        this.syncCards();
      }
    )
    .subscribe()
  
  constructor() {
    makeAutoObservable(this, { autoBind: true });
  }

  // query data

  syncData() {
    // this.reset(); // hannah's wonderful reset button
    this.syncGame();
    this.syncCards();
    this.syncPlayers()
    this.syncWeapons();
    this.syncSuggestion();
  }

  async reset() {
      this.resetGame();
      this.resetCards();
      this.resetSuggestion();
      this.resetWeapons();
      // this.deleteAllPlayers();

      // values for testing purposes
      this.deletePlayer('hannah1');
      this.setPlayerLocation('player1', 'room1');
      this.setPlayerLocation('player2', 'room2');
      this.setCanMove('player1', true);
      this.setCanMove('player2', true);
      this.setCanSuggestion('player1', false);
      this.setCanSuggestion('player2', false);

  }

  // game queries

  async syncGame() {
    const { data, error } = await supabase.from("games")
      .select().single();

    if (data) {
      this.turn = data.turn;
      this.mode = data.mode;
      this.gameId = data.id;
    }
  }

  async resetGame() {
    const gameId = this.getGameId();
    const { error } = await supabase.from("games")
      .update({turn: 0, mode: 'lobby'})
      .eq('id', gameId)
  }

  async setGameMode(mode) {
    const gameId = this.getGameId();
    const { error } = await supabase.from("games")
      .update({mode: mode})
      .eq('id', gameId)
  }

  async setTurn(turn) {
    const id = this.getGameId();
    const { error } = await supabase.from("games")
      .update({turn: turn})
      .eq('id', id)
  }

  // card queries
  
  // cards do not change after being assigned
  async syncCards() {
    if (!this.cardsCached) {
      const { data, error } = await supabase.from("cards").select()
      if (data) {
        this.cards = data;
        if (data.filter(card => card.player_id !== null).length > 0) {
          this.cardsCached = true;
        }
      }
    }
  }

  async resetCards() {
    const { error } = await supabase.from("cards")
      .update({player_id: null})
      .not('player_id', 'is', null)
  }

  // player queries

  async setCardPlayerId(cardId, playerId) {
    const { error } = await supabase.from("cards")
      .update({player_id: playerId})
      .eq('id', cardId);
  }

  async syncPlayers() {
    const { data, error } = await supabase.from("players").select()
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    if (data) {
      const ordered = data.sort(
        (player, other) => {
          const pIdx = colors.indexOf(player.color);
          const oIdx = colors.indexOf(other.color);
          return pIdx - oIdx;
        }
      )
      this.players = ordered;
    }
  }

  async deleteAllPlayers() {
    const { error } = await supabase.from("players")
      .delete()
      .not('id', 'is', null)
  }

  async addPlayer(id, color) {
    const loc = this.getNextRoom();
    const canSuggest = false;
    const canMove = true;
    const { data, error } = await supabase
      .from("players")
      .insert({id: id, loc: loc, color: color, can_suggest: canSuggest, can_move: canMove})
    this.session = id;
  }

  async setCanMove(playerId, canMove) {
    const { error } = await supabase.from("players")
      .update({can_move: canMove})
      .eq('id', playerId)
  }
  
  async deletePlayer(playerId) {
    const { error } = await supabase.from("players")
      .delete()
      .eq('id', playerId)
  }

  async setPlayerLocation(playerId, loc) {
    const { error } = await supabase.from("players")
      .update({loc: loc})
      .eq('id', playerId)
  }

  async setCanSuggestion(playerId, canSuggest) {
    const { error } = await supabase.from("players")
      .update({can_suggest: canSuggest})
      .eq('id', playerId)
  }

  // weapon queries

  async syncWeapons() {
    const { data, error} = await supabase.from("weapons").select()
    if (data) {
      this.weapons = data;
    }
  }

  async setWeaponLocation(weaponId, loc) {
    const { error } = await supabase.from("weapons")
      .update({loc: loc})
      .eq('id', weaponId)
  }

  async resetWeapons() {
    this.setWeaponLocation('weapon1', 'room1');
    this.setWeaponLocation('weapon2', 'room2');
    this.setWeaponLocation('weapon3', 'room3');
    this.setWeaponLocation('weapon4', 'room4');
    this.setWeaponLocation('weapon5', 'room5');
    this.setWeaponLocation('weapon6', 'room6');
  }

  // suggestion queries

  async syncSuggestion() {
    const { data, error} = await supabase.from("suggestions").select().maybeSingle()
    if (data) {
      this.suggestion = data;
    }
  }

  async resetSuggestion() {
    const { error } = await supabase.from("suggestions")
      .update({player: null, weapon: null, room: null, person: null, 
              counter: null, mode: 'S'})
      .not('id', 'is', null)
  }

  async setSuggestionMode(mode) {
    const { error } = await supabase.from("suggestions")
      .update({mode: mode})
      .not('id', 'is', null)
  }

  async setSuggestionPlayer(playerId) {
    const { error } = await supabase.from("suggestions")
      .update({player_id: playerId})
      .not('id', 'is', null)
  }

  async setSuggestion(weapon, room, person) {
    const { error } = await supabase.from("suggestions")
      .update({weapon: weapon, room: room, person: person})
      .not('id', 'is', null)
  }

  async setCounter(counter) {
    const { error } = await supabase.from("suggestions")
      .update({counter: counter})
      .not('id', 'is', null)
  }

  // end of querying


  // game functions
  startGame() {
    this.assignCards();
    this.setGameMode('board');
  }

  newGame() {
    this.reset();
  }

  getGameId() {
    let id = this.gameId;
    if (id) {
      return id;
    } else {
      return 1;
    }
  }

  getGameMode() {
    let mode = this.mode;
    if (mode) {
      return mode
    } else {
      return 'done';
    }
  }
  
  getTurn() {
    let turn = this.turn;
    if (turn) {
      return turn;
    } else {
      return 0;
    }
  }

  canUpdateTurn() {
    let players = this.getPlayers();
    players.filter( player => player.can_move);
    return players.length > 0;
  }

  updateTurn() {
    let turn = this.getTurn();
    let players = this.getPlayers();
    let mode = this.getGameMode();
    let canMove = false;
    let canUpdate = this.canUpdateTurn();

    // prevent an infinite loop
    if (!canUpdate) {
      this.setGameMode('done');
    }

    if (players.length > 0) {
      while (!canMove) {
        turn += 1;
        turn = turn % players.length;
        let player = players[turn];
        canMove = (mode === 'suggestion') || player.can_move;
      }
      this.setTurn(turn);
    }
  }

  updateSuggestionTurn() {
    let turn = this.getSuggestionPlayerTurn();
    let players = this.getPlayers();
    let canMove = false;
    if (players.length > 0) {
      while (!canMove) {
        turn += 1;
        turn = turn % players.length;
        let player = players[turn];
        canMove = player.can_move;
      }
      this.setTurn(turn);
    }
  }


  // player functions
  getPlayers() {
    let players = this.players;
    if (players) {
      return players;
    } else {
      return [];
    }
  }

  getPlayerIndex(id) {
    let players = this.getPlayers();
    for (const idx in players) {
      let player = players[idx];
      if (player.id === id) {
        return idx;
      }
    }
    return -1;
  }
  

  getPlayerById(id) {
    let players = this.getPlayers();
    for (const player of players) {
      if (player.id === id) {
        return player;
      }
    }
    return {};
  }

  getPlayerByColor(color) {
    let players = this.getPlayers();
    for (const player of players) {
      if (player.color === color) {
        return player;
      }
    }
    return {};
  }

  getCurrentPlayer() {
    let turn = this.getTurn();
    let players = this.getPlayers();
    if (turn < players.length && turn > -1) {
      const player = players[turn];
      if (!player.can_move) {
        this.setGameMode('done');
      }
      return player;
    }
    return {};
  }

  canSuggest() {
    let player = this.getCurrentPlayer();
    return player.can_suggest;
  }

  validatePlayer(id) {
    let players = this.getPlayers();
    return !players.includes(id);
  }

  removePlayer() {
    let player = this.getSuggestionPlayer();

    // wait until player is retrieved
    let playerId = player.id;
    this.setCanMove(playerId, false);
    this.updateTurn();
  }

  setLocation(loc) {
    const player = this.getCurrentPlayer();
    if (player && this.isAdjacent(player, loc)) {
      this.setPlayerLocation(player.id, loc);
      this.updateTurn();
      this.setCanSuggestion(player.id, true);
    }
  }

  // weapon functions
  getWeapons() {
    const weapons = this.weapons;
    if (weapons) {
      return weapons;
    } else {
      return [];
    }
  }

  getWeaponByName(name) {
    let weapons = this.getWeapons();
    for (const weapon of weapons) {
      if (weapon.name === name) {
        return weapon;
      }
    }
    return {};
  }
  
  // card functions

  getCards() {
    const cards = this.cards;
    if (cards) {
      return cards;
    } else {
      return [];
    }
  }

  getSolution() {
    let cards = [];
    let all = this.getCards();
    for (const card of all) {
      if (card.player_id === null && card.type !== 'none') {
        cards.push(card)
      }
    }
    return cards;
  }

  getCardById(id) {
    let cards = this.getCards();
    for (const card of cards) {
      if (card.id === id) {
        return card;
      }
    }
    return;
  }

  getCardByName(name) {
    let cards = this.getCards();
    for (const card of cards) {
      if (card.name === name) {
        return card;
      }
    }
    return;
  }

  getCardsByType(type) {
    let cards = [];
    let all = this.getCards();
    for (const card of all) {
      if (card.type === type) {
        cards.push(card)
      }
    }
    return cards;
  }

  getCardsByPlayer(playerId) {
    let cards = [];
    for (let card of this.getCards()) {
      if (card.player_id === playerId) {
        cards.push(card);
      }
    }
    return cards;
  }

  getPlayerCards() {
    let cards = [];
    let curr = this.getCurrentPlayer();
    if (curr.id) {
      cards = this.getCardsByPlayer(curr.id);
    }
    return cards;
  }

  getRandomCard(cards) {
    let idx = Math.floor(Math.random() * cards.length);
    let card = cards[idx];
    cards.splice(idx, 1);
    return card;

  }

  assignCards() {
    // this.resetCards();
    let rooms = this.getCardsByType('room');
    let persons = this.getCardsByType('person');
    let weapons = this.getCardsByType('weapon');

    let room = this.getRandomCard(rooms);
    let person = this.getRandomCard(persons);
    let weapon = this.getRandomCard(weapons);
    this.solution = [person.id, weapon.id, room.id];

    let i = 0;
    let players = this.getPlayers();
    while (rooms.length > 0) {
      let playerId = players[i].id;
      room = this.getRandomCard(rooms);
      this.setCardPlayerId(room.id, playerId);
      i++;
      if (i >= this.getPlayers().length) {
        i = 0;
      }
    }

    while (weapons.length > 0) {
      let playerId = players[i].id;
      weapon = this.getRandomCard(weapons);
      this.setCardPlayerId(weapon.id, playerId);
      i++;
      if (i >= this.getPlayers().length) {
        i = 0;
      }
    }

    while (persons.length > 0) {
      let playerId = players[i].id;
      person = this.getRandomCard(persons);
      this.setCardPlayerId(person.id, playerId);
      i++;
      if (i >= this.getPlayers().length) {
        i = 0;
      }
    }
  }

  // location functions
  getRoomName(id) {
    const locations = this.locations;
    if (id in locations) {
      return locations[id].name;
    } else {
      return '';
    }
  }


  getPlayersAt(loc) {
    const all = this.getPlayers();
    let players = [];
    for (let player of all) {
      if (player.loc === loc) {
        players.push(player);
      }
    }
    return players;
  }

  getWeaponsAt(loc) {
    const all = this.getWeapons();
    let weapons = [];
    for (let weapon of all) {
      if (weapon.loc === loc) {
        weapons.push(weapon);
      }
    }
    return weapons;
  }

  isAdjacent(player, loc) {
    if (player.loc) {
      let curr = this.locations[player.loc];
      return curr.adj.includes(loc);
    } else {
      return false;
    }
  }

  inRoom() {
    let player = this.getCurrentPlayer();
    if (player.loc) {
      let loc = this.locations[player.loc];
      return loc.type === 'room';
    } else {
      return false;
    }
  }

  getNextRoom() {
    let size = this.getPlayers().length;
    return `room${size+1}`
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

  moveCards(cards) {
    let location;
    let player;
    let weapon;
    for (let name of cards) {
      let card = this.getCardByName(name);
      if (card.type === 'person') {
        player = this.getPlayerByColor(name);
      } else if (card.type === 'room') {
        location = this.getRoomByName(name);
      } else if (card.type === 'weapon') {
        weapon = this.getWeaponByName(name);
      }
    }
    if (player && location) {
      this.setPlayerLocation(player.id, location);
      this.setCanSuggestion(player.id, true);
    }
    if (weapon && location) {
      this.setWeaponLocation(weapon.id, location);
    }
  }

  // suggestion functions
  getSuggestion() {
    const suggestion = this.suggestion;
    if (suggestion) {
      return suggestion;
    } else {
      return {};
    }
  }

  getSuggestionMode() {
    const suggestion = this.getSuggestion();
    if (suggestion.mode) {
      return suggestion.mode;
    } else {
      return '';
    }
  }

  getSuggestionCards() {
    const suggestion = this.getSuggestion();
    let cardKeys = ['weapon', 'room', 'person'];
    let cards = [];
    for (let key of cardKeys) {
      let cardId = suggestion[key];
      if (cardId) {
        let card = this.getCardById(cardId);
        cards.push(card);
      }
    }
    return cards;
  }

  getCounterCard() {
    let suggestion = this.getSuggestion();
    let counter = suggestion.counter;
    if (counter) {
      return this.getCardById(counter);
    }
    return;
  }

  getSuggestionPlayer() {
    let suggestion = this.getSuggestion();
    let playerId = suggestion.player_id;
    if (playerId) {
      return this.getPlayerById(playerId);
    }
    return;
  }

  getSuggestionPlayerLoc() {
    const player = this.getSuggestionPlayer();
    if (player) {
      return player.loc
    } else {
      return '';
    }
  }

  getSuggestionPlayerTurn() {
    let player = this.getSuggestionPlayer();
    let turn = this.getPlayerIndex(player.id);
    return turn;
  }

  startSuggestion() {
    let playerId = this.getCurrentPlayer().id;
    this.setSuggestionPlayer(playerId);
    this.setSuggestionMode('S');
    this.setGameMode('suggestion');
    // this.turn = this.fullOrder.indexOf(this.suggestion.player);
  }

  validateAccusation() {
    let cards = this.getSuggestionCards();
    let solution = this.getSolution();
    let correct = true;

    for (let card of cards) {
      if (!solution.includes(card)) {
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
    let player = this.getCurrentPlayer();
    this.setSuggestionPlayer(player.id);
    this.setSuggestionMode('A');
    this.setGameMode('suggestion');
  }

  endSuggestion() {
    this.setGameMode('board');
    this.updateSuggestionTurn();
  }

  acknowledgeAccusation() {
    const mode = this.getSuggestionMode();
    if (mode === 'W') {
      this.setGameMode('done');
    } else {
      this.setGameMode('board');
      this.removePlayer();
    }
  }

  acknowledgeCard() {
    const counter = this.getCounterCard();
    const players = this.getPlayers();
    if (counter === 'card22') {
      let turn = this.getTurn();
      let player = this.getSuggestionPlayer();
      this.setSuggestionMode('C');
      turn += 1;
      turn = turn % players.length;
      if (player !== players[turn]) {
        this.setTurn(turn);
      } else {
        this.endSuggestion();
      }
    } else {
      this.endSuggestion();
    }
  }

  parseSuggestion(cardNames) {
    let suggestion = {
      weapon: null,
      room: null,
      person: null,
    }
    let cards = cardNames.map( name => this.getCardByName(name));
    for (let card of cards) {
      suggestion[card.type] = card.id;
    }
    return suggestion;
  }

  submitSuggestion(cards) {
    let mode = this.getSuggestionMode();
    const suggestion = this.parseSuggestion(cards);
    this.setSuggestion(suggestion.weapon, suggestion.room, suggestion.person);
    const currId = this.getCurrentPlayer().id;
    this.setCanSuggestion(currId, false);
    if (mode === 'S') {
      this.moveCards(cards);
      this.setSuggestionMode('C');
      this.updateTurn();
    } else if (mode === 'A') {
      this.validateAccusation();
    }
  }
  
  submitCard(name) {
    let card = this.getCardByName(name);
    this.setCounter(card.id);
    this.setSuggestionMode('V');
  }
}
