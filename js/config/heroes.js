/**
 * 英雄配置表
 * 自走棋英雄数据，包含属性、种族、职业、技能等
 */

var HEROES = {
  // ============================================================
  // Cost 1 英雄 (8个) —— 基础单位，容易获取
  // ============================================================
  warrior_1: {
    id: 'warrior_1',
    name: '铁甲卫士',
    cost: 1,
    race: '人类',
    class: '战士',
    hp: 600,
    attack: 50,
    defense: 30,
    attackSpeed: 0.7,
    range: 1,
    ability: { name: '坚盾', description: '提升自身护甲值', damage: 0, effect: 'defense_up', value: 20 },
    color: '#8B4513'
  },
  mage_1: {
    id: 'mage_1',
    name: '火灵术士',
    cost: 1,
    race: '人类',
    class: '法师',
    hp: 400,
    attack: 45,
    defense: 15,
    attackSpeed: 0.65,
    range: 3,
    ability: { name: '火球术', description: '向目标发射火球造成魔法伤害', damage: 200, effect: 'magic_damage', value: 200 },
    color: '#FF4500'
  },
  assassin_1: {
    id: 'assassin_1',
    name: '暗影刺客',
    cost: 1,
    race: '精灵',
    class: '刺客',
    hp: 450,
    attack: 55,
    defense: 15,
    attackSpeed: 0.8,
    range: 1,
    ability: { name: '暗袭', description: '跳跃至敌方后排发动致命一击', damage: 250, effect: 'backstab', value: 250 },
    color: '#4B0082'
  },
  ranger_1: {
    id: 'ranger_1',
    name: '哨卫猎手',
    cost: 1,
    race: '精灵',
    class: '射手',
    hp: 420,
    attack: 55,
    defense: 12,
    attackSpeed: 0.75,
    range: 4,
    ability: { name: '多重射击', description: '同时射出三支箭矢', damage: 150, effect: 'multi_shot', value: 3 },
    color: '#228B22'
  },
  knight_1: {
    id: 'knight_1',
    name: '圣光骑兵',
    cost: 1,
    race: '人类',
    class: '骑士',
    hp: 550,
    attack: 45,
    defense: 25,
    attackSpeed: 0.65,
    range: 1,
    ability: { name: '圣光护盾', description: '为自身施加护盾吸收伤害', damage: 0, effect: 'shield', value: 200 },
    color: '#DAA520'
  },
  warrior_2: {
    id: 'warrior_2',
    name: '蛮牙狂战',
    cost: 1,
    race: '兽人',
    class: '战士',
    hp: 650,
    attack: 52,
    defense: 25,
    attackSpeed: 0.7,
    range: 1,
    ability: { name: '狂暴', description: '攻击速度大幅提升', damage: 0, effect: 'attack_speed_up', value: 30 },
    color: '#A0522D'
  },
  summoner_1: {
    id: 'summoner_1',
    name: '蘑菇巫师',
    cost: 1,
    race: '精灵',
    class: '召唤师',
    hp: 400,
    attack: 40,
    defense: 14,
    attackSpeed: 0.6,
    range: 3,
    ability: { name: '蘑菇召唤', description: '召唤小蘑菇为己方作战', damage: 0, effect: 'summon', value: 1 },
    color: '#9ACD32'
  },
  mage_2: {
    id: 'mage_2',
    name: '骸骨法师',
    cost: 1,
    race: '亡灵',
    class: '法师',
    hp: 380,
    attack: 48,
    defense: 12,
    attackSpeed: 0.65,
    range: 3,
    ability: { name: '暗影弹', description: '发射暗影能量弹攻击敌方', damage: 180, effect: 'magic_damage', value: 180 },
    color: '#696969'
  },

  // ============================================================
  // Cost 2 英雄 (6个) —— 中低费，核心过渡
  // ============================================================
  knight_2: {
    id: 'knight_2',
    name: '寒霜骑士',
    cost: 2,
    race: '人类',
    class: '骑士',
    hp: 700,
    attack: 55,
    defense: 35,
    attackSpeed: 0.65,
    range: 1,
    ability: { name: '冰霜之力', description: '攻击附带减速效果', damage: 100, effect: 'slow', value: 30 },
    color: '#4682B4'
  },
  ranger_2: {
    id: 'ranger_2',
    name: '机关弩手',
    cost: 2,
    race: '机械',
    class: '射手',
    hp: 500,
    attack: 65,
    defense: 18,
    attackSpeed: 0.8,
    range: 4,
    ability: { name: '速射弩', description: '短时间内极速射击', damage: 120, effect: 'rapid_fire', value: 4 },
    color: '#B8860B'
  },
  assassin_2: {
    id: 'assassin_2',
    name: '疾风忍者',
    cost: 2,
    race: '人类',
    class: '刺客',
    hp: 520,
    attack: 65,
    defense: 18,
    attackSpeed: 0.85,
    range: 1,
    ability: { name: '影分身', description: '分裂出分身同时攻击', damage: 180, effect: 'clone_attack', value: 2 },
    color: '#2F4F4F'
  },
  warrior_3: {
    id: 'warrior_3',
    name: '石甲傀儡',
    cost: 2,
    race: '机械',
    class: '战士',
    hp: 800,
    attack: 48,
    defense: 45,
    attackSpeed: 0.55,
    range: 1,
    ability: { name: '石化壁垒', description: '提升全体友军护甲', damage: 0, effect: 'team_defense_up', value: 15 },
    color: '#708090'
  },
  summoner_2: {
    id: 'summoner_2',
    name: '亡灵牧师',
    cost: 2,
    race: '亡灵',
    class: '召唤师',
    hp: 480,
    attack: 42,
    defense: 16,
    attackSpeed: 0.6,
    range: 3,
    ability: { name: '亡灵召唤', description: '召唤骷髅士兵加入战斗', damage: 0, effect: 'summon', value: 2 },
    color: '#556B2F'
  },
  mage_3: {
    id: 'mage_3',
    name: '雷霆法师',
    cost: 2,
    race: '兽人',
    class: '法师',
    hp: 450,
    attack: 58,
    defense: 16,
    attackSpeed: 0.7,
    range: 3,
    ability: { name: '连环闪电', description: '释放闪电在敌人之间弹射', damage: 250, effect: 'chain_lightning', value: 3 },
    color: '#6A5ACD'
  },

  // ============================================================
  // Cost 3 英雄 (5个) —— 中费核心，阵容关键
  // ============================================================
  assassin_3: {
    id: 'assassin_3',
    name: '幻影剑姬',
    cost: 3,
    race: '精灵',
    class: '刺客',
    hp: 600,
    attack: 80,
    defense: 22,
    attackSpeed: 0.9,
    range: 1,
    ability: { name: '幻影连斩', description: '瞬间发动多次斩击', damage: 400, effect: 'multi_strike', value: 4 },
    color: '#C71585'
  },
  knight_3: {
    id: 'knight_3',
    name: '狂狮骑将',
    cost: 3,
    race: '兽人',
    class: '骑士',
    hp: 900,
    attack: 65,
    defense: 45,
    attackSpeed: 0.6,
    range: 1,
    ability: { name: '狮心咆哮', description: '咆哮使周围敌人减攻', damage: 150, effect: 'attack_debuff', value: 25 },
    color: '#CD853F'
  },
  ranger_3: {
    id: 'ranger_3',
    name: '精灵游侠',
    cost: 3,
    race: '精灵',
    class: '射手',
    hp: 550,
    attack: 85,
    defense: 20,
    attackSpeed: 0.85,
    range: 5,
    ability: { name: '穿透之箭', description: '射出贯穿多个目标的箭矢', damage: 350, effect: 'pierce_shot', value: 3 },
    color: '#3CB371'
  },
  mage_4: {
    id: 'mage_4',
    name: '冰霜女巫',
    cost: 3,
    race: '亡灵',
    class: '法师',
    hp: 500,
    attack: 70,
    defense: 18,
    attackSpeed: 0.7,
    range: 4,
    ability: { name: '暴风雪', description: '在区域内降下暴风雪冰冻敌人', damage: 450, effect: 'aoe_freeze', value: 2 },
    color: '#00CED1'
  },
  warrior_4: {
    id: 'warrior_4',
    name: '龙裔武士',
    cost: 3,
    race: '龙族',
    class: '战士',
    hp: 850,
    attack: 72,
    defense: 38,
    attackSpeed: 0.7,
    range: 1,
    ability: { name: '龙息斩', description: '挥出带有龙焰的强力一刀', damage: 380, effect: 'fire_slash', value: 380 },
    color: '#B22222'
  },

  // ============================================================
  // Cost 4 英雄 (3个) —— 高费强力，后期核心
  // ============================================================
  summoner_3: {
    id: 'summoner_3',
    name: '龙语贤者',
    cost: 4,
    race: '龙族',
    class: '召唤师',
    hp: 700,
    attack: 60,
    defense: 25,
    attackSpeed: 0.65,
    range: 3,
    ability: { name: '巨龙召唤', description: '召唤幼龙加入战斗', damage: 0, effect: 'summon_dragon', value: 1 },
    color: '#8B0000'
  },
  ranger_4: {
    id: 'ranger_4',
    name: '机械猎鹰',
    cost: 4,
    race: '机械',
    class: '射手',
    hp: 650,
    attack: 100,
    defense: 22,
    attackSpeed: 0.9,
    range: 5,
    ability: { name: '导弹齐射', description: '向全体敌方发射追踪导弹', damage: 500, effect: 'aoe_missile', value: 500 },
    color: '#DC143C'
  },
  knight_4: {
    id: 'knight_4',
    name: '亡灵君王',
    cost: 4,
    race: '亡灵',
    class: '骑士',
    hp: 1100,
    attack: 75,
    defense: 50,
    attackSpeed: 0.6,
    range: 1,
    ability: { name: '亡者之握', description: '束缚敌方并持续造成伤害', damage: 600, effect: 'drain_life', value: 300 },
    color: '#483D8B'
  },

  // ============================================================
  // Cost 5 英雄 (2个) —— 传说级，极难获取，超强能力
  // ============================================================
  mage_5: {
    id: 'mage_5',
    name: '天启龙神',
    cost: 5,
    race: '龙族',
    class: '法师',
    hp: 800,
    attack: 90,
    defense: 30,
    attackSpeed: 0.75,
    range: 5,
    ability: { name: '天火陨灭', description: '从天空召唤陨石轰炸全场', damage: 900, effect: 'aoe_meteor', value: 900 },
    color: '#FF1493'
  },
  warrior_5: {
    id: 'warrior_5',
    name: '兽王霸主',
    cost: 5,
    race: '兽人',
    class: '战士',
    hp: 1400,
    attack: 110,
    defense: 55,
    attackSpeed: 0.75,
    range: 1,
    ability: { name: '霸王践踏', description: '跃起重击大地震伤周围所有敌人', damage: 800, effect: 'aoe_slam', value: 800 },
    color: '#FF6347'
  }
};

// 英雄池容量 —— 每个费用等级的英雄在公共卡池中的副本数
var HERO_POOL_SIZE = {
  1: 29,  // 每个1费英雄有29张
  2: 22,  // 每个2费英雄有22张
  3: 18,  // 每个3费英雄有18张
  4: 12,  // 每个4费英雄有12张
  5: 10   // 每个5费英雄有10张
};

// 升星所需相同英雄数量：3合1
var STAR_UP_COUNT = 3;

module.exports = {
  HEROES: HEROES,
  HERO_POOL_SIZE: HERO_POOL_SIZE,
  STAR_UP_COUNT: STAR_UP_COUNT
};
