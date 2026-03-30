var GameConfig = require('../config/game-config');
var Hero = require('./hero');
var Board = require('./board');
var Shop = require('./shop');
var SynergySystem = require('./synergy');

class Player {
  constructor(isHuman) {
    this.isHuman = isHuman !== false;
    this.hp = GameConfig.INITIAL_HP;
    this.gold = GameConfig.INITIAL_GOLD;
    this.level = GameConfig.INITIAL_LEVEL;
    this.xp = 0;
    this.winStreak = 0;
    this.loseStreak = 0;
    
    this.board = new Board();
    this.bench = new Array(GameConfig.BENCH_SLOTS).fill(null);
    this.shop = new Shop();
    this.synergy = new SynergySystem();
    
    this.alive = true;
  }
  
  // Get max units allowed on board
  getMaxUnits() {
    return GameConfig.LEVEL_UNIT_COUNT[this.level] || 1;
  }
  
  // Buy hero from shop slot
  buyHero(slotIndex) {
    var offer = this.shop.getOfferInfo(slotIndex);
    if (!offer) return null;
    if (this.gold < offer.cost) return null;
    
    var heroId = this.shop.buyHero(slotIndex);
    if (!heroId) return null;
    
    this.gold -= offer.cost;
    
    // Try to merge (star up) first
    if (this._tryMerge(heroId)) {
      return 'merged';
    }
    
    // Place on bench
    var benchSlot = this._findEmptyBench();
    if (benchSlot === -1) return null; // Bench full, can't buy
    
    var hero = new Hero(heroId);
    hero.benchIndex = benchSlot;
    hero.isOnBench = true;
    this.bench[benchSlot] = hero;
    return hero;
  }
  
  // Try to merge 3 same heroes into star up
  _tryMerge(heroId) {
    // Find all heroes with same id and same star on bench and board
    var sameHeroes = [];
    
    // Check bench
    for (var i = 0; i < this.bench.length; i++) {
      if (this.bench[i] && this.bench[i].id === heroId && this.bench[i].star === 1) {
        sameHeroes.push({ hero: this.bench[i], location: 'bench', index: i });
      }
    }
    
    // Check board
    var boardHeroes = this.board.getAllHeroes();
    for (var j = 0; j < boardHeroes.length; j++) {
      if (boardHeroes[j].id === heroId && boardHeroes[j].star === 1) {
        sameHeroes.push({ hero: boardHeroes[j], location: 'board' });
      }
    }
    
    // Need 2 existing + 1 new = 3 for star up
    if (sameHeroes.length >= 2) {
      // Star up the first one, remove the other
      var keeper = sameHeroes[0];
      var sacrifice = sameHeroes[1];
      
      keeper.hero.starUp();
      
      // Remove sacrifice
      if (sacrifice.location === 'bench') {
        this.bench[sacrifice.index] = null;
      } else {
        this.board.removeHero(sacrifice.hero.boardRow, sacrifice.hero.boardCol);
      }
      
      // Check for 3-star merge (3 two-stars)
      this._tryMergeStar2(heroId);
      
      return true;
    }
    
    return false;
  }
  
  _tryMergeStar2(heroId) {
    var star2Heroes = [];
    
    for (var i = 0; i < this.bench.length; i++) {
      if (this.bench[i] && this.bench[i].id === heroId && this.bench[i].star === 2) {
        star2Heroes.push({ hero: this.bench[i], location: 'bench', index: i });
      }
    }
    
    var boardHeroes = this.board.getAllHeroes();
    for (var j = 0; j < boardHeroes.length; j++) {
      if (boardHeroes[j].id === heroId && boardHeroes[j].star === 2) {
        star2Heroes.push({ hero: boardHeroes[j], location: 'board' });
      }
    }
    
    if (star2Heroes.length >= 3) {
      var keeper = star2Heroes[0];
      keeper.hero.starUp(); // Becomes 3-star
      
      for (var k = 1; k < 3; k++) {
        var sac = star2Heroes[k];
        if (sac.location === 'bench') {
          this.bench[sac.index] = null;
        } else {
          this.board.removeHero(sac.hero.boardRow, sac.hero.boardCol);
        }
      }
    }
  }
  
  // Sell hero from bench
  sellFromBench(benchIndex) {
    var hero = this.bench[benchIndex];
    if (!hero) return false;
    
    var sellPrice = hero.cost * hero.star;
    this.gold = Math.min(GameConfig.MAX_GOLD, this.gold + sellPrice);
    this.shop.returnHero(hero.id, 1);
    this.bench[benchIndex] = null;
    return true;
  }
  
  // Sell hero from board
  sellFromBoard(row, col) {
    var hero = this.board.removeHero(row, col);
    if (!hero) return false;
    
    var sellPrice = hero.cost * hero.star;
    this.gold = Math.min(GameConfig.MAX_GOLD, this.gold + sellPrice);
    this.shop.returnHero(hero.id, 1);
    return true;
  }
  
  // Move hero from bench to board
  benchToBoard(benchIndex, row, col) {
    if (this.board.getHeroCount() >= this.getMaxUnits()) return false;
    var hero = this.bench[benchIndex];
    if (!hero) return false;
    
    if (this.board.placeHero(hero, row, col)) {
      this.bench[benchIndex] = null;
      return true;
    }
    return false;
  }
  
  // Move hero from board to bench
  boardToBench(row, col) {
    var hero = this.board.removeHero(row, col);
    if (!hero) return false;
    
    var benchSlot = this._findEmptyBench();
    if (benchSlot === -1) {
      // Put back on board
      this.board.placeHero(hero, row, col);
      return false;
    }
    
    hero.benchIndex = benchSlot;
    hero.isOnBench = true;
    this.bench[benchSlot] = hero;
    return true;
  }
  
  _findEmptyBench() {
    for (var i = 0; i < this.bench.length; i++) {
      if (!this.bench[i]) return i;
    }
    return -1;
  }
  
  // Refresh shop
  refreshShop() {
    if (this.gold < GameConfig.REFRESH_COST) return false;
    this.gold -= GameConfig.REFRESH_COST;
    this.shop.roll(this.level);
    return true;
  }
  
  // Free roll (start of round)
  freeRoll() {
    this.shop.roll(this.level);
  }
  
  // Buy XP
  buyXP() {
    if (this.gold < GameConfig.XP_COST) return false;
    if (this.level >= GameConfig.MAX_LEVEL) return false;
    this.gold -= GameConfig.XP_COST;
    this.addXP(4);
    return true;
  }
  
  addXP(amount) {
    this.xp += amount;
    while (this.level < GameConfig.MAX_LEVEL && this.xp >= GameConfig.LEVEL_XP[this.level]) {
      this.xp -= GameConfig.LEVEL_XP[this.level];
      this.level++;
    }
  }
  
  // Calculate income for new round
  calculateIncome() {
    var income = GameConfig.BASE_INCOME;
    
    // Interest
    var interest = Math.min(GameConfig.MAX_INTEREST, Math.floor(this.gold * GameConfig.INTEREST_RATE));
    income += interest;
    
    // Streak bonus
    if (this.winStreak > 0) {
      var streakIdx = Math.min(this.winStreak, GameConfig.WIN_STREAK_GOLD.length - 1);
      income += GameConfig.WIN_STREAK_GOLD[streakIdx];
    } else if (this.loseStreak > 0) {
      var loseIdx = Math.min(this.loseStreak, GameConfig.LOSE_STREAK_GOLD.length - 1);
      income += GameConfig.LOSE_STREAK_GOLD[loseIdx];
    }
    
    return income;
  }
  
  // Apply round income
  receiveIncome() {
    var income = this.calculateIncome();
    this.gold = Math.min(GameConfig.MAX_GOLD, this.gold + income);
    this.addXP(GameConfig.XP_PER_ROUND);
    return income;
  }
  
  // Take damage after losing battle
  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }
  
  // Record battle result
  recordResult(won) {
    if (won) {
      this.winStreak++;
      this.loseStreak = 0;
    } else {
      this.loseStreak++;
      this.winStreak = 0;
    }
  }
  
  // Calculate synergies based on board heroes
  updateSynergies() {
    var heroes = this.board.getAllHeroes();
    this.synergy.calculate(heroes);
    this.synergy.applyBonuses(heroes);
  }
  
  // Generate AI army (for enemy/PvE)
  generateAIArmy(round) {
    var boardHeroes = this.board.getAllHeroes();
    if (boardHeroes.length > 0) return; // Already has army
    
    var heroIds = Object.keys(require('../config/heroes').HEROES);
    var count = Math.min(this.getMaxUnits(), Math.floor(round / 2) + 1);
    
    for (var i = 0; i < count; i++) {
      var randomId = heroIds[Math.floor(Math.random() * heroIds.length)];
      var hero = new Hero(randomId);
      var cell = this.board.findEmptyCell();
      if (cell) {
        this.board.placeHero(hero, cell.row, cell.col);
      }
    }
  }
}

module.exports = Player;
