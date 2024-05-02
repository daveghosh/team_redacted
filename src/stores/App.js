import { makeAutoObservable } from 'mobx';
import { createClient } from '@supabase/supabase-js';


const PROJECT_URL = 'https://omdvfmknrfqpoeebpnfd.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZHZmbWtucmZxcG9lZWJwbmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxOTYwNjUsImV4cCI6MjAyODc3MjA2NX0.kfomW6iWicmLnvghJvegc1duqCFO0w7trFEIqEKZYvQ';
const supabase = createClient(PROJECT_URL, ANON_KEY);

// Table names
const GAMES_TABLE = 'games';
const PLAYERS_TABLE = 'players';
const WEAPONS_TABLE = 'weapons';
const CARDS_TABLE = 'cards';
const SUG_TABLE = 'suggestions';

const LOCATIONS = {
  // top rooms
  room1:  { type: 'room', name: 'ballroom', align: 'none', adj: ["hall1", "hall3", "room9"]},
  hall1:  { type: 'hall', align: 'horizontal', adj: ["room1", "room2"]},
  room2:  { type: 'room', name: 'billiard room', align: 'none', adj: ["hall1", "hall2", "hall4"]},
  hall2:  { type: 'hall', align: 'horizontal', adj: ["room2", "room3"]},
  room3:  { type: 'room', name: 'conservatory', align: 'none', adj: ["hall2", "hall5", "room7"]},

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
  room7:  { type: 'room', name: 'library', align: 'none', adj: ["hall8", "hall11", "room3"]},
  hall11: { type: 'hall', align: 'horizontal', adj: ["room7", "room8"]},
  room8:  { type: 'room', name: 'lounge', align: 'none', adj: ["hall9", "hall11", "hall12"]},
  hall12: { type: 'hall', align: 'horizontal', adj: ["room8", "room9"]},
  room9:  { type: 'room', name: 'study', align: 'none', adj: ["hall10", "hall12", "room1"]},
}

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

  notes = {
    'red': 0, 'orange': 0, 'yellow': 0, 'green': 0, 'blue': 0, 'purple': 0,
    'ballroom': 0, 'billiard': 0, 'conserv.': 0, 'dining': 0,
    'hall': 0, 'kitchen': 0, 'library': 0, 'lounge': 0, 'study': 0,
    'revolver': 0, 'dagger': 0, 'lead pipe': 0, 'rope': 0, 'candlest.': 0, 'wrench': 0
  }

  channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: GAMES_TABLE,
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
        table: SUG_TABLE,
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
        table: PLAYERS_TABLE,
      },
      () => {
        this.syncPlayers();
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: WEAPONS_TABLE
      },
      () => {
        this.syncWeapons();
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: CARDS_TABLE,
      },
      () => {
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
      this.resetSuggestion();
      this.resetWeapons();
      this.deleteAllPlayers()
      this.resetNotes();
  }

  // game queries

  async syncGame() {
    const { data, error } = await supabase.from(GAMES_TABLE)
      .select().single();

    if (data) {
      this.turn = data.turn;
      this.mode = data.mode;
      this.gameId = data.id;
    }
  }

  async resetGame() {
    const gameId = this.getGameId();
    const { error } = await supabase.from(GAMES_TABLE)
      .update({turn: 0, mode: 'lobby'})
      .eq('id', gameId)
  }

  async setGameMode(mode) {
    const gameId = this.getGameId();
    const { error } = await supabase.from(GAMES_TABLE)
      .update({mode: mode})
      .eq('id', gameId)
  }

  async setTurn(turn) {
    const id = this.getGameId();
    const { error } = await supabase.from(GAMES_TABLE)
      .update({turn: turn})
      .eq('id', id)
  }

  // card queries
  
  async syncCards() {
      const { data, error } = await supabase.from(CARDS_TABLE).select()
      if (data) {
        this.cards = data;
      }
  }

  // set the player_id of each card in cardIds
  async batchSetPlayerId(playerId, cardIds) {
    const { error } = await supabase.from(CARDS_TABLE)
      .update({player_id: playerId})
      .in('id', cardIds)
  }

  // player queries

  async syncPlayers() {
    const { data, error } = await supabase.from(PLAYERS_TABLE).select()
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    if (data) {
      // order the players by color of the rainbow
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
    const { error } = await supabase.from(PLAYERS_TABLE)
      .delete()
      .not('id', 'is', null)
  }

  async deletePlayer(playerId) {
    const { error } = await supabase.from(PLAYERS_TABLE)
      .delete()
      .eq('id', playerId)
  }

  async addPlayer(id, color) {
    const loc = this.getNextRoom();
    const canSuggest = false;
    const canMove = true;
    const { data, error } = await supabase
      .from(PLAYERS_TABLE)
      .insert({id: id, loc: loc, color: color, can_suggest: canSuggest, can_move: canMove})
    this.session = id;
  }

  async setCanMove(playerId, canMove) {
    const { error } = await supabase.from(PLAYERS_TABLE)
      .update({can_move: canMove})
      .eq('id', playerId)
  }

  async setPlayerLocation(playerId, loc) {
    const { error } = await supabase.from(PLAYERS_TABLE)
      .update({loc: loc})
      .eq('id', playerId)
  }

  async setCanSuggestion(playerId, canSuggest) {
    const { error } = await supabase.from(PLAYERS_TABLE)
      .update({can_suggest: canSuggest})
      .eq('id', playerId)
  }

  // weapon queries

  async syncWeapons() {
    const { data, error} = await supabase.from(WEAPONS_TABLE).select()
    if (data) {
      this.weapons = data;
    }
  }

  async setWeaponLocation(weaponId, loc) {
    const { error } = await supabase.from(WEAPONS_TABLE)
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
    const { data, error} = await supabase.from(SUG_TABLE).select().maybeSingle()
    if (data) {
      this.suggestion = data;
    }
  }

  async resetSuggestion() {
    const gameId = this.getGameId();
    const { error } = await supabase.from(SUG_TABLE)
      .update({player_id: null, weapon: null, room: null, person: null, 
              counter: null, mode: 'S'})
      .eq('id', gameId)
  }

  async setSuggestionMode(mode) {
    const gameId = this.getGameId();
    const { error } = await supabase.from(SUG_TABLE)
      .update({mode: mode})
      .eq('id', gameId)
  }

  async setSuggestionPlayer(playerId) {
    const gameId = this.getGameId();
    const { error } = await supabase.from(SUG_TABLE)
      .update({player_id: playerId})
      .eq('id', gameId)
  }

  async setSuggestionCards(weapon, room, person) {
    const gameId = this.getGameId();
    const { error } = await supabase.from(SUG_TABLE)
      .update({weapon: weapon, room: room, person: person})
      .eq('id', gameId)
  }

  async setCounter(counter) {
    const gameId = this.getGameId();
    const { error } = await supabase.from(SUG_TABLE)
      .update({counter: counter})
      .eq('id', gameId)
  }

  // end of querying


  // debug function
  isValidState() {
    const mode = this.mode;
    const session = this.session
    if (mode !== 'lobby' && session === null) {
      return false;
    } else {
      return true;
    }
  }

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
      return 'board';
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

  // see if player at index can move
  canMove(idx) {
    const mode = this.getGameMode();
    const player = this.getPlayers()[idx];
    return (mode === 'suggestion') || (player.can_move);
  }

  updateTurn() {
    let turn = this.getTurn();
    let players = this.getPlayers();
    let canMove = false;

    // infinite loop precautions
    const moveable = this.getCanMove(); 
    if (moveable.length === 0) {
      this.setGameMode('done');
    }
    let timeout = 0;

    while (!canMove && timeout < players.length) {
      turn += 1;
      turn = turn % players.length;
      canMove = this.canMove(turn);
      timeout++;
    }

    if (canMove ) {
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

  getCanMove() {
    const players = this.players;
    return players.filter( player => player.can_move);
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

  // check if session player has made a suggestion
  isSuggestionPlayer() {
    const player = this.getSuggestionPlayer();
    if (player) {
      return player.id === this.session;
    } else {
      return false;
    }
  }

  getCurrentPlayer() {
    let turn = this.getTurn();
    let players = this.getPlayers();
    if (turn < players.length && turn > -1) {
      const player = players[turn];
      return player;
    }
    return {};
  }

  isActive() {
    const curr = this.getCurrentPlayer();
    return curr.id === this.session;
  }

  canSuggest() {
    let player = this.getCurrentPlayer();
    return player.can_suggest && this.isActive();
  }

  validatePlayer(id) {
    let players = this.getPlayers();
    return !players.includes(id);
  }

  removePlayer() {
    const moveable = this.getCanMove();
    if (moveable.length < 2) {
      this.setGameMode('done');
    } else {
      let player = this.getSuggestionPlayer();
      let playerId = player.id;
      this.setCanMove(playerId, false);
      this.updateTurn();
    }
  }

  // set the location of the current player
  getLocations() {
    return LOCATIONS;
  }


  setLocation(loc) {
    const player = this.getCurrentPlayer();
    if (player && this.canMoveTo(player, loc)) {
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

  // get the cards of the session player
  getPlayerCards() {
    let cards = [];
    let curr = this.session;
    if (curr) {
      cards = this.getCardsByPlayer(curr);
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
    let rooms = this.getCardsByType('room');
    let persons = this.getCardsByType('person');
    let weapons = this.getCardsByType('weapon');

    let room = this.getRandomCard(rooms);
    let person = this.getRandomCard(persons);
    let weapon = this.getRandomCard(weapons);
    this.solution = [person.id, weapon.id, room.id];

    let players = this.getPlayers();
    let cardMap = {};
    players.forEach( player => cardMap[player.id] = []);

    let i = 0;
    let card;
    while (rooms.length > 0) {
      let playerId = players[i].id;
      card = this.getRandomCard(rooms);
      cardMap[playerId].push(card.id);
      i++;
      if (i >= this.getPlayers().length) {
        i = 0;
      }
    }

    while (weapons.length > 0) {
      let playerId = players[i].id;
      card = this.getRandomCard(weapons);
      cardMap[playerId].push(card.id);
      i++;
      if (i >= this.getPlayers().length) {
        i = 0;
      }
    }

    while (persons.length > 0) {
      let playerId = players[i].id;
      card = this.getRandomCard(persons);
      cardMap[playerId].push(card.id);
      i++;
      if (i >= this.getPlayers().length) {
        i = 0;
      }
    }

    for (const player of players) {
      const cards = cardMap[player.id];
      this.batchSetPlayerId(player.id, cards);
    }
  }

  // location functions
  getRoomName(id) {
    if (id in LOCATIONS) {
      return LOCATIONS[id].name;
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

  isOccupied(loc) {
    const players = this.getPlayers();
    const playerLocs = players.map( player => player.loc);
    return playerLocs.includes(loc);
  }

  isFull(loc) {
    const location = LOCATIONS[loc];
    if (location.type === 'room') {
      return false;
    } else {
      return this.isOccupied(loc);
    }
  }

  isAdjacent(player, loc) {
    if (player.id !== this.session) {
      return false;
    } else if (player.loc) {
      let curr = LOCATIONS[player.loc];
      return curr.adj.includes(loc);
    } else {
      return false;
    }
  }

  canMoveTo(player, loc) {
    const adj = this.isAdjacent(player, loc);
    const full = this.isFull(loc);
    return adj && !full;
  }

  inRoom() {
    let player = this.getCurrentPlayer();
    if (player.loc) {
      let loc = LOCATIONS[player.loc];
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
    for (const[id, value] of Object.entries(LOCATIONS)) {
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
  }

  validateAccusation(cards) {
    let solution = this.getSolution().map( card => card.name);
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
    if (counter.id === 'card22') {
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
    this.setSuggestionCards(suggestion.weapon, suggestion.room, suggestion.person);
    const currId = this.getCurrentPlayer().id;
    this.setCanSuggestion(currId, false);
    if (mode === 'S') {
      this.moveCards(cards);
      this.setSuggestionMode('C');
      this.updateTurn();
    } else if (mode === 'A') {
      this.validateAccusation(cards);
    }
  }
  
  submitCard(name) {
    let card = this.getCardByName(name);
    this.setCounter(card.id);
    if (card.id === 'card22') {
      this.setSuggestionMode('N');
    } else {
      this.setSuggestionMode('V');
    }
  }

  // note functions
  updateNote(note) {
    let value = this.notes[note];
    if (value === 0) {
      value = 1;
    } else if (value === 1) {
      value = -1;
    } else if (value === -1) {
      value = 0;
    }
    this.notes[note] = value;
  }

  resetNotes() {
    for (const [key] of Object.keys(this.notes)) {
      this.notes[key] = 0;
    }
  }

  getNote(note) {
    return this.notes[note];
  }

}

