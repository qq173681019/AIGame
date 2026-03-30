var GameConfig = require('../config/game-config');

class Board {
  constructor() {
    this.rows = GameConfig.BOARD_ROWS;
    this.cols = GameConfig.BOARD_COLS;
    this.grid = []; // 2D array [row][col] = hero or null
    this.clear();
  }
  
  clear() {
    this.grid = [];
    for (var r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (var c = 0; c < this.cols; c++) {
        this.grid[r][c] = null;
      }
    }
  }
  
  placeHero(hero, row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
    if (this.grid[row][col] !== null) return false;
    
    // Remove from old position if on board
    if (hero.isOnBoard && hero.boardRow >= 0 && hero.boardCol >= 0) {
      this.grid[hero.boardRow][hero.boardCol] = null;
    }
    
    this.grid[row][col] = hero;
    hero.boardRow = row;
    hero.boardCol = col;
    hero.isOnBoard = true;
    hero.isOnBench = false;
    hero.benchIndex = -1;
    return true;
  }
  
  removeHero(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    var hero = this.grid[row][col];
    if (hero) {
      this.grid[row][col] = null;
      hero.isOnBoard = false;
      hero.boardRow = -1;
      hero.boardCol = -1;
    }
    return hero;
  }
  
  getHero(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return this.grid[row][col];
  }
  
  getAllHeroes() {
    var heroes = [];
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          heroes.push(this.grid[r][c]);
        }
      }
    }
    return heroes;
  }
  
  getHeroCount() {
    return this.getAllHeroes().length;
  }
  
  // Find empty cell nearest to (row, col)
  findEmptyCell() {
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === null) return { row: r, col: c };
      }
    }
    return null;
  }
  
  // Convert pixel position to grid position
  pixelToGrid(px, py) {
    var col = Math.floor((px - GameConfig.BOARD_OFFSET_X) / GameConfig.CELL_SIZE);
    var row = Math.floor((py - GameConfig.BOARD_OFFSET_Y) / GameConfig.CELL_SIZE);
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      return { row: row, col: col };
    }
    return null;
  }
  
  // Convert grid position to pixel center
  gridToPixel(row, col) {
    return {
      x: GameConfig.BOARD_OFFSET_X + col * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2,
      y: GameConfig.BOARD_OFFSET_Y + row * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2
    };
  }
  
  // Swap two positions
  swapPositions(row1, col1, row2, col2) {
    var hero1 = this.grid[row1][col1];
    var hero2 = this.grid[row2][col2];
    this.grid[row1][col1] = hero2;
    this.grid[row2][col2] = hero1;
    if (hero1) { hero1.boardRow = row2; hero1.boardCol = col2; }
    if (hero2) { hero2.boardRow = row1; hero2.boardCol = col1; }
  }
}

module.exports = Board;
