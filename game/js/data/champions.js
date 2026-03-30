/**
 * 棋子数据 - Champion Data
 * 包含所有可用棋子的属性定义
 */
const ChampionData = [
  // ===== 1费棋子 =====
  {
    id: 'warrior_1',
    name: '铁甲战士',
    cost: 1,
    hp: 600,
    attack: 50,
    defense: 35,
    attackSpeed: 0.7,
    range: 1,
    mana: 70,
    synergies: ['warrior', 'iron'],
    skill: { name: '盾击', damage: 150, type: 'physical' },
    emoji: '⚔️'
  },
  {
    id: 'archer_1',
    name: '精灵射手',
    cost: 1,
    hp: 450,
    attack: 55,
    defense: 15,
    attackSpeed: 0.8,
    range: 3,
    mana: 60,
    synergies: ['ranger', 'elf'],
    skill: { name: '连射', damage: 120, type: 'physical' },
    emoji: '🏹'
  },
  {
    id: 'mage_1',
    name: '学徒法师',
    cost: 1,
    hp: 400,
    attack: 40,
    defense: 15,
    attackSpeed: 0.6,
    range: 3,
    mana: 50,
    synergies: ['mage', 'human'],
    skill: { name: '火球术', damage: 200, type: 'magic' },
    emoji: '🔥'
  },
  {
    id: 'tank_1',
    name: '石甲卫士',
    cost: 1,
    hp: 750,
    attack: 35,
    defense: 50,
    attackSpeed: 0.5,
    range: 1,
    mana: 80,
    synergies: ['guardian', 'rock'],
    skill: { name: '石化护盾', damage: 0, type: 'buff', shieldAmount: 300 },
    emoji: '🛡️'
  },
  {
    id: 'assassin_1',
    name: '暗影刺客',
    cost: 1,
    hp: 400,
    attack: 65,
    defense: 15,
    attackSpeed: 0.9,
    range: 1,
    mana: 50,
    synergies: ['assassin', 'shadow'],
    skill: { name: '暗袭', damage: 250, type: 'physical' },
    emoji: '🗡️'
  },

  // ===== 2费棋子 =====
  {
    id: 'warrior_2',
    name: '狂战士',
    cost: 2,
    hp: 700,
    attack: 65,
    defense: 30,
    attackSpeed: 0.8,
    range: 1,
    mana: 70,
    synergies: ['warrior', 'berserker'],
    skill: { name: '狂暴斩', damage: 250, type: 'physical' },
    emoji: '🪓'
  },
  {
    id: 'mage_2',
    name: '冰霜女巫',
    cost: 2,
    hp: 500,
    attack: 50,
    defense: 20,
    attackSpeed: 0.65,
    range: 3,
    mana: 60,
    synergies: ['mage', 'ice'],
    skill: { name: '暴风雪', damage: 280, type: 'magic' },
    emoji: '❄️'
  },
  {
    id: 'ranger_2',
    name: '猎鹰游侠',
    cost: 2,
    hp: 550,
    attack: 70,
    defense: 20,
    attackSpeed: 0.85,
    range: 3,
    mana: 65,
    synergies: ['ranger', 'beast'],
    skill: { name: '鹰击', damage: 200, type: 'physical' },
    emoji: '🦅'
  },
  {
    id: 'guardian_2',
    name: '圣光骑士',
    cost: 2,
    hp: 800,
    attack: 45,
    defense: 45,
    attackSpeed: 0.55,
    range: 1,
    mana: 80,
    synergies: ['guardian', 'holy'],
    skill: { name: '圣光庇护', damage: 0, type: 'heal', healAmount: 400 },
    emoji: '⚜️'
  },
  {
    id: 'assassin_2',
    name: '幻影忍者',
    cost: 2,
    hp: 500,
    attack: 80,
    defense: 20,
    attackSpeed: 1.0,
    range: 1,
    mana: 55,
    synergies: ['assassin', 'ninja'],
    skill: { name: '分身斩', damage: 300, type: 'physical' },
    emoji: '🥷'
  },

  // ===== 3费棋子 =====
  {
    id: 'warrior_3',
    name: '龙骑将军',
    cost: 3,
    hp: 900,
    attack: 80,
    defense: 45,
    attackSpeed: 0.75,
    range: 1,
    mana: 80,
    synergies: ['warrior', 'dragon'],
    skill: { name: '龙啸', damage: 400, type: 'physical' },
    emoji: '🐉'
  },
  {
    id: 'mage_3',
    name: '雷电法王',
    cost: 3,
    hp: 600,
    attack: 65,
    defense: 25,
    attackSpeed: 0.7,
    range: 3,
    mana: 70,
    synergies: ['mage', 'thunder'],
    skill: { name: '雷霆万钧', damage: 450, type: 'magic' },
    emoji: '⚡'
  },
  {
    id: 'ranger_3',
    name: '风暴游侠',
    cost: 3,
    hp: 650,
    attack: 85,
    defense: 25,
    attackSpeed: 0.9,
    range: 4,
    mana: 60,
    synergies: ['ranger', 'wind'],
    skill: { name: '风暴箭雨', damage: 350, type: 'physical' },
    emoji: '🌪️'
  },
  {
    id: 'assassin_3',
    name: '血影魔刃',
    cost: 3,
    hp: 600,
    attack: 100,
    defense: 25,
    attackSpeed: 1.1,
    range: 1,
    mana: 55,
    synergies: ['assassin', 'demon'],
    skill: { name: '血刃风暴', damage: 500, type: 'physical' },
    emoji: '😈'
  },

  // ===== 4费棋子 =====
  {
    id: 'warrior_4',
    name: '天神战将',
    cost: 4,
    hp: 1100,
    attack: 95,
    defense: 55,
    attackSpeed: 0.8,
    range: 1,
    mana: 90,
    synergies: ['warrior', 'divine'],
    skill: { name: '天神下凡', damage: 600, type: 'physical' },
    emoji: '👑'
  },
  {
    id: 'mage_4',
    name: '凤凰法师',
    cost: 4,
    hp: 750,
    attack: 80,
    defense: 30,
    attackSpeed: 0.7,
    range: 3,
    mana: 80,
    synergies: ['mage', 'phoenix'],
    skill: { name: '涅槃烈焰', damage: 650, type: 'magic' },
    emoji: '🔮'
  },
  {
    id: 'guardian_4',
    name: '不朽圣盾',
    cost: 4,
    hp: 1300,
    attack: 55,
    defense: 70,
    attackSpeed: 0.5,
    range: 1,
    mana: 100,
    synergies: ['guardian', 'divine'],
    skill: { name: '不朽之墙', damage: 0, type: 'buff', shieldAmount: 800 },
    emoji: '🏰'
  },

  // ===== 5费棋子 =====
  {
    id: 'warrior_5',
    name: '混沌魔神',
    cost: 5,
    hp: 1400,
    attack: 120,
    defense: 60,
    attackSpeed: 0.85,
    range: 1,
    mana: 100,
    synergies: ['warrior', 'demon', 'divine'],
    skill: { name: '混沌裁决', damage: 900, type: 'physical' },
    emoji: '💀'
  },
  {
    id: 'mage_5',
    name: '星辰大法师',
    cost: 5,
    hp: 900,
    attack: 100,
    defense: 35,
    attackSpeed: 0.75,
    range: 4,
    mana: 90,
    synergies: ['mage', 'elf', 'holy'],
    skill: { name: '星辰陨落', damage: 1000, type: 'magic' },
    emoji: '🌟'
  },
  {
    id: 'assassin_5',
    name: '虚空之影',
    cost: 5,
    hp: 800,
    attack: 140,
    defense: 30,
    attackSpeed: 1.2,
    range: 1,
    mana: 60,
    synergies: ['assassin', 'shadow', 'ninja'],
    skill: { name: '虚空收割', damage: 1200, type: 'physical' },
    emoji: '👻'
  },
];

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChampionData;
}
