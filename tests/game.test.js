/**
 * 游戏核心模块测试 - Game Core Tests
 * 使用 Node.js 内置 assert 模块
 */
const assert = require('assert');

// 加载模块
const GameConfig = require('../game/js/config.js');
const ChampionData = require('../game/js/data/champions.js');
const SynergyData = require('../game/js/data/synergies.js');
const Chess = require('../game/js/core/Chess.js');
const Board = require('../game/js/core/Board.js');
const Player = require('../game/js/core/Player.js');
const Shop = require('../game/js/core/Shop.js');
const Synergy = require('../game/js/core/Synergy.js');
const Battle = require('../game/js/core/Battle.js');
const GameEngine = require('../game/js/core/GameEngine.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${e.message}`);
    failed++;
  }
}

// ========== Chess Tests ==========
console.log('\n📦 Chess Tests');

test('Create a 1-star chess piece', () => {
  const data = ChampionData[0]; // warrior_1
  const chess = new Chess(data);
  assert.strictEqual(chess.star, 1);
  assert.strictEqual(chess.name, '铁甲战士');
  assert.strictEqual(chess.cost, 1);
  assert.strictEqual(chess.hp, 600);
  assert.strictEqual(chess.maxHp, 600);
  assert.strictEqual(chess.isAlive, true);
});

test('Create a 2-star chess piece with scaled stats', () => {
  const data = ChampionData[0];
  const chess = new Chess(data, 2);
  assert.strictEqual(chess.star, 2);
  assert.strictEqual(chess.maxHp, Math.floor(600 * 1.8));
  assert.strictEqual(chess.attack, Math.floor(50 * 1.8));
});

test('Chess takes damage', () => {
  const data = ChampionData[0];
  const chess = new Chess(data);
  const initialHp = chess.hp;
  chess.takeDamage(100, 'physical');
  assert.ok(chess.hp < initialHp);
  assert.ok(chess.isAlive);
});

test('Chess dies when HP reaches 0', () => {
  const data = ChampionData[0];
  const chess = new Chess(data);
  chess.takeDamage(99999, 'physical');
  assert.strictEqual(chess.hp, 0);
  assert.strictEqual(chess.isAlive, false);
});

test('Chess performs attack', () => {
  const attacker = new Chess(ChampionData[0]);
  const target = new Chess(ChampionData[1]);
  const initialHp = target.hp;
  attacker.performAttack(target);
  assert.ok(target.hp < initialHp);
});

test('Chess mana increases on attack and damage', () => {
  const attacker = new Chess(ChampionData[0]);
  const target = new Chess(ChampionData[1]);
  attacker.performAttack(target);
  assert.ok(attacker.mana > 0, 'Attacker should gain mana');
  assert.ok(target.mana > 0, 'Target should gain mana from taking damage');
});

test('Chess shield absorbs damage', () => {
  const chess = new Chess(ChampionData[0]);
  chess.shield = 500;
  chess.takeDamage(100, 'magic');
  assert.ok(chess.shield > 0);
  assert.strictEqual(chess.hp, chess.maxHp);
});

test('Chess clone creates independent copy', () => {
  const chess = new Chess(ChampionData[0]);
  const clone = chess.clone();
  assert.strictEqual(clone.name, chess.name);
  assert.strictEqual(clone.maxHp, chess.maxHp);
  clone.hp = 0;
  assert.ok(chess.hp > 0); // original unaffected
});

test('Chess canMergeWith works correctly', () => {
  const chess1 = new Chess(ChampionData[0]);
  const chess2 = new Chess(ChampionData[0]);
  const chess3 = new Chess(ChampionData[1]);
  assert.ok(chess1.canMergeWith(chess2));
  assert.ok(!chess1.canMergeWith(chess3));
});

test('Chess resetForBattle restores full HP', () => {
  const chess = new Chess(ChampionData[0]);
  chess.hp = 100;
  chess.mana = 50;
  chess.resetForBattle();
  assert.strictEqual(chess.hp, chess.maxHp);
  assert.strictEqual(chess.mana, 0);
});

// ========== Board Tests ==========
console.log('\n📦 Board Tests');

test('Create board with correct dimensions', () => {
  const board = new Board(4, 7);
  assert.strictEqual(board.rows, 4);
  assert.strictEqual(board.cols, 7);
});

test('Place and retrieve unit', () => {
  const board = new Board(4, 7);
  const chess = new Chess(ChampionData[0]);
  assert.ok(board.placeUnit(chess, 0, 0));
  assert.strictEqual(board.getUnit(0, 0), chess);
  assert.strictEqual(chess.row, 0);
  assert.strictEqual(chess.col, 0);
});

test('Cannot place unit on occupied cell', () => {
  const board = new Board(4, 7);
  const c1 = new Chess(ChampionData[0]);
  const c2 = new Chess(ChampionData[1]);
  board.placeUnit(c1, 0, 0);
  assert.ok(!board.placeUnit(c2, 0, 0));
});

test('Remove unit from board', () => {
  const board = new Board(4, 7);
  const chess = new Chess(ChampionData[0]);
  board.placeUnit(chess, 1, 2);
  const removed = board.removeUnit(1, 2);
  assert.strictEqual(removed, chess);
  assert.strictEqual(board.getUnit(1, 2), null);
});

test('Move unit on board', () => {
  const board = new Board(4, 7);
  const chess = new Chess(ChampionData[0]);
  board.placeUnit(chess, 0, 0);
  assert.ok(board.moveUnit(0, 0, 1, 1));
  assert.strictEqual(board.getUnit(1, 1), chess);
  assert.strictEqual(board.getUnit(0, 0), null);
});

test('Swap units on board', () => {
  const board = new Board(4, 7);
  const c1 = new Chess(ChampionData[0]);
  const c2 = new Chess(ChampionData[1]);
  board.placeUnit(c1, 0, 0);
  board.placeUnit(c2, 1, 1);
  board.swapUnits(0, 0, 1, 1);
  assert.strictEqual(board.getUnit(0, 0), c2);
  assert.strictEqual(board.getUnit(1, 1), c1);
});

test('Get all units from board', () => {
  const board = new Board(4, 7);
  board.placeUnit(new Chess(ChampionData[0]), 0, 0);
  board.placeUnit(new Chess(ChampionData[1]), 1, 1);
  const units = board.getAllUnits();
  assert.strictEqual(units.length, 2);
});

test('Board distance calculation', () => {
  assert.strictEqual(Board.distance(0, 0, 3, 4), 4);
  assert.strictEqual(Board.distance(0, 0, 0, 0), 0);
  assert.strictEqual(Board.distance(1, 1, 2, 2), 1);
});

test('Get empty cells', () => {
  const board = new Board(4, 7);
  board.placeUnit(new Chess(ChampionData[0]), 0, 0);
  const empty = board.getEmptyCells();
  assert.strictEqual(empty.length, 27); // 4*7 - 1
});

test('Create battle board', () => {
  const playerUnits = [new Chess(ChampionData[0])];
  playerUnits[0].row = 0;
  playerUnits[0].col = 0;
  const enemyUnits = [new Chess(ChampionData[1])];
  enemyUnits[0].row = 0;
  enemyUnits[0].col = 0;
  const battleBoard = Board.createBattleBoard(playerUnits, enemyUnits, 7);
  assert.ok(battleBoard.getUnit(0, 0) !== null);
  assert.ok(battleBoard.getUnit(7, 6) !== null);
});

// ========== Player Tests ==========
console.log('\n📦 Player Tests');

test('Create player with starting values', () => {
  const player = new Player(GameConfig);
  assert.strictEqual(player.hp, GameConfig.STARTING_HP);
  assert.strictEqual(player.gold, GameConfig.STARTING_GOLD);
  assert.strictEqual(player.level, 1);
});

test('Player add XP and level up', () => {
  const player = new Player(GameConfig);
  player.level = 2; // need 6 xp to level to 3
  player.addXp(10);
  assert.ok(player.level >= 3);
});

test('Player buy XP', () => {
  const player = new Player(GameConfig);
  player.gold = 20;
  player.level = 2;
  const leveled = player.buyXp();
  assert.strictEqual(player.gold, 16);
});

test('Player cannot buy XP without gold', () => {
  const player = new Player(GameConfig);
  player.gold = 0;
  assert.strictEqual(player.buyXp(), false);
});

test('Player interest calculation', () => {
  const player = new Player(GameConfig);
  player.gold = 50;
  assert.strictEqual(player.getInterest(), 5); // max interest
  player.gold = 20;
  assert.strictEqual(player.getInterest(), 2);
});

test('Player win/loss streak', () => {
  const player = new Player(GameConfig);
  player.recordWin();
  player.recordWin();
  player.recordWin();
  assert.strictEqual(player.winStreak, 3);
  assert.strictEqual(player.getStreakBonus(), 2);
  player.recordLoss(5);
  assert.strictEqual(player.winStreak, 0);
  assert.strictEqual(player.loseStreak, 1);
});

test('Player add/remove from bench', () => {
  const player = new Player(GameConfig);
  const chess = new Chess(ChampionData[0]);
  const idx = player.addToBench(chess);
  assert.ok(idx >= 0);
  assert.strictEqual(player.getBenchCount(), 1);
  player.removeFromBench(idx);
  assert.strictEqual(player.getBenchCount(), 0);
});

test('Player bench full detection', () => {
  const player = new Player(GameConfig);
  for (let i = 0; i < GameConfig.BENCH_SLOTS; i++) {
    player.addToBench(new Chess(ChampionData[0]));
  }
  assert.strictEqual(player.addToBench(new Chess(ChampionData[0])), -1);
});

test('Player income calculation', () => {
  const player = new Player(GameConfig);
  player.gold = 30;
  player.winStreak = 3;
  const income = player.calculateIncome();
  // base(5) + interest(3) + streak(2) = 10
  assert.strictEqual(income, 10);
});

// ========== Shop Tests ==========
console.log('\n📦 Shop Tests');

test('Shop refresh fills all slots', () => {
  const shop = new Shop(GameConfig, ChampionData);
  shop.refresh(5);
  for (let i = 0; i < GameConfig.SHOP_SLOTS; i++) {
    assert.ok(shop.getSlot(i) !== null, `Slot ${i} should not be null`);
  }
});

test('Shop buy removes champion from slot', () => {
  const shop = new Shop(GameConfig, ChampionData);
  shop.refresh(5);
  const champion = shop.buy(0);
  assert.ok(champion !== null);
  assert.strictEqual(shop.getSlot(0), null);
});

test('Shop lock prevents refresh', () => {
  const shop = new Shop(GameConfig, ChampionData);
  shop.refresh(5);
  const firstSlot = shop.getSlot(0);
  shop.toggleLock();
  assert.ok(shop.isLocked());
  shop.refresh(5);
  assert.strictEqual(shop.getSlot(0), firstSlot); // unchanged
});

// ========== Synergy Tests ==========
console.log('\n📦 Synergy Tests');

test('Calculate active synergies', () => {
  const synergy = new Synergy(SynergyData);
  const units = [
    new Chess(ChampionData.find(c => c.id === 'warrior_1')),
    new Chess(ChampionData.find(c => c.id === 'warrior_2')),
  ];
  const active = synergy.calculateActiveSynergies(units);
  const warriorSynergy = active.find(s => s.id === 'warrior');
  assert.ok(warriorSynergy, 'Warrior synergy should be active');
  assert.strictEqual(warriorSynergy.count, 2);
});

test('Apply synergy bonuses to units', () => {
  const synergy = new Synergy(SynergyData);
  const units = [
    new Chess(ChampionData.find(c => c.id === 'warrior_1')),
    new Chess(ChampionData.find(c => c.id === 'warrior_2')),
  ];
  const active = synergy.calculateActiveSynergies(units);
  synergy.applyBonuses(units, active);
  assert.ok(units[0].bonuses.defense > 0, 'Warrior should have defense bonus');
  assert.ok(units[0].bonuses.attack > 0, 'Warrior should have attack bonus');
});

test('Synergy not activated with insufficient units', () => {
  const synergy = new Synergy(SynergyData);
  const units = [
    new Chess(ChampionData.find(c => c.id === 'warrior_1')),
  ];
  const active = synergy.calculateActiveSynergies(units);
  const warriorSynergy = active.find(s => s.id === 'warrior');
  assert.ok(!warriorSynergy, 'Warrior synergy should not be active with 1 unit');
});

// ========== Battle Tests ==========
console.log('\n📦 Battle Tests');

test('Battle runs to completion', () => {
  const playerUnits = [new Chess(ChampionData[0])];
  playerUnits[0].row = 1;
  playerUnits[0].col = 3;

  const enemyUnits = [new Chess(ChampionData[1])];
  enemyUnits[0].row = 2;
  enemyUnits[0].col = 3;

  const battleBoard = Board.createBattleBoard(playerUnits, enemyUnits, 7);
  const battle = new Battle(battleBoard, 7);

  const winner = battle.runToCompletion();
  assert.ok(['player', 'enemy', 'draw'].includes(winner));
  assert.ok(battle.isFinished);
});

test('Battle calculates damage', () => {
  const playerUnits = [new Chess(ChampionData[0])];
  playerUnits[0].row = 0;
  playerUnits[0].col = 0;
  const enemyUnits = [new Chess(ChampionData[1])];
  enemyUnits[0].row = 0;
  enemyUnits[0].col = 0;

  const battleBoard = Board.createBattleBoard(playerUnits, enemyUnits, 7);
  const battle = new Battle(battleBoard, 7);
  battle.runToCompletion();
  const damage = battle.calculateDamage();
  assert.ok(damage >= 2, 'Damage should be at least 2');
});

// ========== GameEngine Tests ==========
console.log('\n📦 GameEngine Tests');

test('GameEngine initializes correctly', () => {
  const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
    Board, Chess, Player, Shop, Battle, Synergy
  });
  engine.init();
  assert.strictEqual(engine.phase, 'prep');
  assert.strictEqual(engine.round, 1);
  assert.strictEqual(engine.player.gold, GameConfig.STARTING_GOLD);
});

test('GameEngine buy champion', () => {
  const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
    Board, Chess, Player, Shop, Battle, Synergy
  });
  engine.init();
  engine.player.gold = 50;
  const result = engine.buyChampion(0);
  assert.strictEqual(result.success, true);
  assert.ok(engine.player.getBenchCount() >= 1 || engine.board.getUnitCount() >= 1);
});

test('GameEngine buy champion with no gold fails', () => {
  const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
    Board, Chess, Player, Shop, Battle, Synergy
  });
  engine.init();
  engine.player.gold = 0;
  const result = engine.buyChampion(0);
  assert.strictEqual(result.success, false);
});

test('GameEngine bench to board', () => {
  const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
    Board, Chess, Player, Shop, Battle, Synergy
  });
  engine.init();
  engine.player.gold = 50;
  engine.buyChampion(0);

  if (engine.player.getBenchCount() > 0) {
    // Find bench index with a chess piece
    let benchIdx = -1;
    for (let i = 0; i < engine.player.bench.length; i++) {
      if (engine.player.bench[i]) { benchIdx = i; break; }
    }
    if (benchIdx >= 0) {
      const result = engine.benchToBoard(benchIdx, 0, 0);
      assert.strictEqual(result.success, true);
      assert.ok(engine.board.getUnit(0, 0) !== null);
    }
  }
});

test('GameEngine refresh shop', () => {
  const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
    Board, Chess, Player, Shop, Battle, Synergy
  });
  engine.init();
  engine.player.gold = 50;
  const result = engine.refreshShop();
  assert.strictEqual(result.success, true);
  assert.strictEqual(engine.player.gold, 48);
});

test('GameEngine sell from bench', () => {
  const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
    Board, Chess, Player, Shop, Battle, Synergy
  });
  engine.init();
  engine.player.gold = 50;
  engine.buyChampion(0);

  let benchIdx = -1;
  for (let i = 0; i < engine.player.bench.length; i++) {
    if (engine.player.bench[i]) { benchIdx = i; break; }
  }
  if (benchIdx >= 0) {
    const goldBefore = engine.player.gold;
    const result = engine.sellFromBench(benchIdx);
    assert.strictEqual(result.success, true);
    assert.ok(engine.player.gold > goldBefore);
  }
});

test('GameEngine start battle', () => {
  const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
    Board, Chess, Player, Shop, Battle, Synergy
  });
  engine.init();

  // Place a unit on board
  const chess = new Chess(ChampionData[0]);
  engine.board.placeUnit(chess, 0, 0);
  engine.player.level = 3; // allow more units

  const battle = engine.startBattle();
  assert.ok(battle !== null);
  assert.strictEqual(engine.phase, 'battle');
});

test('GameEngine full round cycle', () => {
  const engine = new GameEngine(GameConfig, ChampionData, SynergyData, {
    Board, Chess, Player, Shop, Battle, Synergy
  });

  let phaseChanges = [];
  engine.onPhaseChange = (phase, round) => phaseChanges.push(phase);
  engine.onBattleResult = () => {};

  engine.init();
  assert.strictEqual(engine.phase, 'prep');

  // Buy and place a unit
  engine.player.gold = 50;
  engine.buyChampion(0);
  let benchIdx = -1;
  for (let i = 0; i < engine.player.bench.length; i++) {
    if (engine.player.bench[i]) { benchIdx = i; break; }
  }
  if (benchIdx >= 0) {
    engine.benchToBoard(benchIdx, 0, 0);
  }

  // Start battle
  engine.startBattle();
  assert.strictEqual(engine.phase, 'battle');

  // Run battle ticks
  while (engine.currentBattle && !engine.currentBattle.isFinished) {
    engine.battleTick();
  }

  // Should transition to result
  assert.ok(['result', 'battle'].includes(engine.phase) || engine.player.hp <= 0);
});

// ========== Data Integrity Tests ==========
console.log('\n📦 Data Integrity Tests');

test('All champions have required fields', () => {
  const required = ['id', 'name', 'cost', 'hp', 'attack', 'defense',
    'attackSpeed', 'range', 'mana', 'synergies', 'skill', 'emoji'];
  for (const champ of ChampionData) {
    for (const field of required) {
      assert.ok(champ[field] !== undefined, `${champ.id} missing ${field}`);
    }
    assert.ok(champ.cost >= 1 && champ.cost <= 5, `${champ.id} invalid cost`);
    assert.ok(champ.synergies.length > 0, `${champ.id} has no synergies`);
  }
});

test('All synergies referenced by champions exist', () => {
  for (const champ of ChampionData) {
    for (const syn of champ.synergies) {
      assert.ok(SynergyData[syn], `Synergy "${syn}" from ${champ.id} not found`);
    }
  }
});

test('All synergies have proper tier structure', () => {
  for (const [id, syn] of Object.entries(SynergyData)) {
    assert.ok(syn.name, `${id} missing name`);
    assert.ok(syn.tiers && syn.tiers.length > 0, `${id} missing tiers`);
    for (const tier of syn.tiers) {
      assert.ok(tier.count > 0, `${id} tier has invalid count`);
      assert.ok(tier.bonus, `${id} tier missing bonus`);
    }
  }
});

test('Config has required fields', () => {
  assert.ok(GameConfig.BOARD_ROWS > 0);
  assert.ok(GameConfig.BOARD_COLS > 0);
  assert.ok(GameConfig.SHOP_SLOTS > 0);
  assert.ok(GameConfig.STARTING_GOLD > 0);
  assert.ok(GameConfig.STARTING_HP > 0);
  assert.ok(GameConfig.SHOP_ODDS.length > 0);
});

// ========== Summary ==========
console.log('\n' + '='.repeat(40));
console.log(`总计: ${passed + failed} 测试`);
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log('='.repeat(40));

if (failed > 0) {
  process.exit(1);
}
