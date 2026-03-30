/**
 * 羁绊配置表
 * 种族羁绊与职业羁绊，满足一定数量后触发增益效果
 */

// ============================================================
// 种族羁绊 (Race Synergies)
// ============================================================
var RACE_SYNERGIES = {
  '人类': {
    name: '人类',
    description: '人类英雄获得额外法力回复，更快释放技能',
    levels: [
      { count: 2, bonus: { manaRegen: 10 }, description: '2人类: +10法力回复' },
      { count: 4, bonus: { manaRegen: 25 }, description: '4人类: +25法力回复' },
      { count: 6, bonus: { manaRegen: 45 }, description: '6人类: +45法力回复' }
    ]
  },
  '精灵': {
    name: '精灵',
    description: '精灵英雄获得闪避几率，有概率完全躲避攻击',
    levels: [
      { count: 2, bonus: { dodge: 15 }, description: '2精灵: +15%闪避' },
      { count: 4, bonus: { dodge: 30 }, description: '4精灵: +30%闪避' }
    ]
  },
  '兽人': {
    name: '兽人',
    description: '兽人英雄获得额外最大生命值',
    levels: [
      { count: 2, bonus: { hpBonus: 150 }, description: '2兽人: +150生命值' },
      { count: 4, bonus: { hpBonus: 350 }, description: '4兽人: +350生命值' },
      { count: 6, bonus: { hpBonus: 600 }, description: '6兽人: +600生命值' }
    ]
  },
  '亡灵': {
    name: '亡灵',
    description: '亡灵英雄的攻击降低目标护甲',
    levels: [
      { count: 2, bonus: { armorReduction: 20 }, description: '2亡灵: 降低目标20护甲' },
      { count: 4, bonus: { armorReduction: 45 }, description: '4亡灵: 降低目标45护甲' }
    ]
  },
  '龙族': {
    name: '龙族',
    description: '龙族英雄战斗开始时获得满法力值',
    levels: [
      { count: 2, bonus: { fullMana: true }, description: '2龙族: 开局满蓝' },
      { count: 3, bonus: { fullMana: true, spellPower: 30 }, description: '3龙族: 开局满蓝且+30%技能伤害' }
    ]
  },
  '机械': {
    name: '机械',
    description: '机械英雄战斗开始时获得护盾',
    levels: [
      { count: 2, bonus: { shield: 200 }, description: '2机械: 获得200护盾' },
      { count: 4, bonus: { shield: 500 }, description: '4机械: 获得500护盾' }
    ]
  }
};

// ============================================================
// 职业羁绊 (Class Synergies)
// ============================================================
var CLASS_SYNERGIES = {
  '战士': {
    name: '战士',
    description: '战士获得额外护甲，越多越坚韧',
    levels: [
      { count: 2, bonus: { defense: 15 }, description: '2战士: +15护甲' },
      { count: 4, bonus: { defense: 35 }, description: '4战士: +35护甲' },
      { count: 6, bonus: { defense: 60 }, description: '6战士: +60护甲' }
    ]
  },
  '法师': {
    name: '法师',
    description: '法师的技能降低全体敌方魔抗',
    levels: [
      { count: 2, bonus: { magicPen: 15 }, description: '2法师: 降低敌方15魔抗' },
      { count: 4, bonus: { magicPen: 35 }, description: '4法师: 降低敌方35魔抗' },
      { count: 6, bonus: { magicPen: 55 }, description: '6法师: 降低敌方55魔抗' }
    ]
  },
  '刺客': {
    name: '刺客',
    description: '刺客获得额外暴击率和暴击伤害',
    levels: [
      { count: 2, bonus: { critRate: 10, critDamage: 20 }, description: '2刺客: +10%暴击率, +20%暴击伤害' },
      { count: 4, bonus: { critRate: 25, critDamage: 50 }, description: '4刺客: +25%暴击率, +50%暴击伤害' },
      { count: 6, bonus: { critRate: 40, critDamage: 80 }, description: '6刺客: +40%暴击率, +80%暴击伤害' }
    ]
  },
  '射手': {
    name: '射手',
    description: '射手获得额外攻击速度',
    levels: [
      { count: 2, bonus: { attackSpeed: 15 }, description: '2射手: +15%攻击速度' },
      { count: 4, bonus: { attackSpeed: 35 }, description: '4射手: +35%攻击速度' }
    ]
  },
  '骑士': {
    name: '骑士',
    description: '骑士有几率格挡伤害，保护队友',
    levels: [
      { count: 2, bonus: { blockChance: 20, blockAmount: 15 }, description: '2骑士: 20%几率格挡15%伤害' },
      { count: 4, bonus: { blockChance: 35, blockAmount: 25 }, description: '4骑士: 35%几率格挡25%伤害' },
      { count: 6, bonus: { blockChance: 50, blockAmount: 35 }, description: '6骑士: 50%几率格挡35%伤害' }
    ]
  },
  '召唤师': {
    name: '召唤师',
    description: '召唤物获得额外生命值和攻击力',
    levels: [
      { count: 2, bonus: { summonHp: 30, summonAttack: 30 }, description: '2召唤师: 召唤物+30%生命和攻击' },
      { count: 4, bonus: { summonHp: 60, summonAttack: 60 }, description: '4召唤师: 召唤物+60%生命和攻击' }
    ]
  }
};

module.exports = {
  RACE_SYNERGIES: RACE_SYNERGIES,
  CLASS_SYNERGIES: CLASS_SYNERGIES
};
