/**
 * 羁绊(协同效果)数据 - Synergy Data
 */
const SynergyData = {
  // ===== 职业羁绊 =====
  warrior: {
    name: '战士',
    type: 'class',
    description: '战士获得额外护甲和攻击力',
    icon: '⚔️',
    tiers: [
      { count: 2, bonus: { defense: 20, attack: 10 }, desc: '+20护甲 +10攻击' },
      { count: 4, bonus: { defense: 50, attack: 25 }, desc: '+50护甲 +25攻击' },
      { count: 6, bonus: { defense: 80, attack: 45 }, desc: '+80护甲 +45攻击' },
    ]
  },
  mage: {
    name: '法师',
    type: 'class',
    description: '法师获得法术强度加成',
    icon: '🔮',
    tiers: [
      { count: 2, bonus: { spellPower: 0.20 }, desc: '法术伤害+20%' },
      { count: 4, bonus: { spellPower: 0.50 }, desc: '法术伤害+50%' },
      { count: 6, bonus: { spellPower: 0.85 }, desc: '法术伤害+85%' },
    ]
  },
  ranger: {
    name: '游侠',
    type: 'class',
    description: '游侠有几率获得额外攻击速度',
    icon: '🏹',
    tiers: [
      { count: 2, bonus: { attackSpeedBonus: 0.30 }, desc: '攻击速度+30%' },
      { count: 4, bonus: { attackSpeedBonus: 0.70 }, desc: '攻击速度+70%' },
    ]
  },
  guardian: {
    name: '守护者',
    type: 'class',
    description: '战斗开始时，守护者为相邻友军提供护盾',
    icon: '🛡️',
    tiers: [
      { count: 2, bonus: { shieldAmount: 200 }, desc: '护盾值200' },
      { count: 4, bonus: { shieldAmount: 500 }, desc: '护盾值500' },
    ]
  },
  assassin: {
    name: '刺客',
    type: 'class',
    description: '刺客跳向敌方后排，获得暴击加成',
    icon: '🗡️',
    tiers: [
      { count: 2, bonus: { critChance: 0.15, critDamage: 0.30 }, desc: '暴击率+15% 暴击伤害+30%' },
      { count: 4, bonus: { critChance: 0.30, critDamage: 0.60 }, desc: '暴击率+30% 暴击伤害+60%' },
    ]
  },

  // ===== 种族羁绊 =====
  human: {
    name: '人类',
    type: 'origin',
    description: '人类每次施法后回复法力',
    icon: '👤',
    tiers: [
      { count: 2, bonus: { manaRestore: 15 }, desc: '施法后回复15法力' },
      { count: 4, bonus: { manaRestore: 35 }, desc: '施法后回复35法力' },
    ]
  },
  elf: {
    name: '精灵',
    type: 'origin',
    description: '精灵获得闪避几率',
    icon: '🧝',
    tiers: [
      { count: 2, bonus: { dodgeChance: 0.20 }, desc: '20%闪避率' },
      { count: 4, bonus: { dodgeChance: 0.40 }, desc: '40%闪避率' },
    ]
  },
  demon: {
    name: '恶魔',
    type: 'origin',
    description: '恶魔有几率燃烧敌方法力',
    icon: '😈',
    tiers: [
      { count: 2, bonus: { manaBurn: 20 }, desc: '燃烧20法力' },
      { count: 4, bonus: { manaBurn: 50 }, desc: '燃烧50法力' },
    ]
  },
  dragon: {
    name: '龙族',
    type: 'origin',
    description: '龙族免疫魔法伤害一定比例',
    icon: '🐲',
    tiers: [
      { count: 2, bonus: { magicResist: 0.40 }, desc: '魔法减伤40%' },
    ]
  },
  shadow: {
    name: '暗影',
    type: 'origin',
    description: '暗影单位攻击时有几率造成额外伤害',
    icon: '🌑',
    tiers: [
      { count: 2, bonus: { bonusDamage: 0.30 }, desc: '额外伤害30%' },
      { count: 3, bonus: { bonusDamage: 0.65 }, desc: '额外伤害65%' },
    ]
  },
  divine: {
    name: '神圣',
    type: 'origin',
    description: '神圣单位在生命值低时获得免伤',
    icon: '✨',
    tiers: [
      { count: 2, bonus: { damageReduction: 0.25 }, desc: '低于50%生命时减伤25%' },
    ]
  },
  iron: {
    name: '钢铁',
    type: 'origin',
    description: '钢铁单位获得额外生命值',
    icon: '🔩',
    tiers: [
      { count: 2, bonus: { bonusHp: 300 }, desc: '+300生命值' },
    ]
  },
  rock: {
    name: '岩石',
    type: 'origin',
    description: '岩石单位受到的伤害降低',
    icon: '🪨',
    tiers: [
      { count: 2, bonus: { damageReduction: 0.15 }, desc: '减伤15%' },
    ]
  },
  beast: {
    name: '野兽',
    type: 'origin',
    description: '野兽阵亡后为友方提供攻击力加成',
    icon: '🐾',
    tiers: [
      { count: 2, bonus: { deathAttackBonus: 30 }, desc: '阵亡后友方+30攻击' },
    ]
  },
  ice: {
    name: '冰霜',
    type: 'origin',
    description: '冰霜单位攻击有减速效果',
    icon: '🧊',
    tiers: [
      { count: 2, bonus: { slowPercent: 0.25 }, desc: '减速25%' },
    ]
  },
  holy: {
    name: '光明',
    type: 'origin',
    description: '光明单位为友方治疗',
    icon: '☀️',
    tiers: [
      { count: 2, bonus: { healPercent: 0.10 }, desc: '每回合治疗10%最大生命' },
    ]
  },
  thunder: {
    name: '雷电',
    type: 'origin',
    description: '雷电单位攻击时有几率链式闪电',
    icon: '⚡',
    tiers: [
      { count: 2, bonus: { chainDamage: 100 }, desc: '链式闪电100伤害' },
    ]
  },
  wind: {
    name: '疾风',
    type: 'origin',
    description: '疾风单位获得攻击速度加成',
    icon: '💨',
    tiers: [
      { count: 2, bonus: { attackSpeedBonus: 0.35 }, desc: '攻击速度+35%' },
    ]
  },
  berserker: {
    name: '狂战',
    type: 'origin',
    description: '生命越低攻击力越高',
    icon: '🔥',
    tiers: [
      { count: 2, bonus: { lowHpAttackBonus: 0.50 }, desc: '低于50%生命攻击+50%' },
    ]
  },
  ninja: {
    name: '忍者',
    type: 'origin',
    description: '只有1或4个忍者时激活效果',
    icon: '🌙',
    tiers: [
      { count: 1, bonus: { attack: 50, spellPower: 0.50 }, desc: '单忍者+50攻击+50%法强' },
      { count: 4, bonus: { attack: 80, spellPower: 0.80 }, desc: '全忍者+80攻击+80%法强' },
    ]
  },
  phoenix: {
    name: '凤凰',
    type: 'origin',
    description: '凤凰单位死亡后复活一次',
    icon: '🔥',
    tiers: [
      { count: 1, bonus: { revive: true, reviveHpPercent: 0.30 }, desc: '死亡后复活，30%生命' },
    ]
  },
};

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SynergyData;
}
