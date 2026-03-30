/**
 * 羁绊系统 - Synergy Calculator
 * 计算激活的羁绊并应用加成
 */
class Synergy {
  /**
   * @param {object} synergyData - SynergyData
   */
  constructor(synergyData) {
    this.data = synergyData;
  }

  /**
   * 计算当前场上棋子激活的羁绊
   * @param {Chess[]} units - 场上的棋子列表
   * @returns {Array} 激活的羁绊列表
   */
  calculateActiveSynergies(units) {
    // 统计每种羁绊的棋子数量(同名棋子只算一次)
    const synergyCounts = {};
    const uniqueIds = new Set();

    for (const unit of units) {
      if (uniqueIds.has(unit.id)) continue;
      uniqueIds.add(unit.id);
      for (const syn of unit.synergies) {
        synergyCounts[syn] = (synergyCounts[syn] || 0) + 1;
      }
    }

    // 确定激活的羁绊及其等级
    const activeSynergies = [];
    for (const [synergyId, count] of Object.entries(synergyCounts)) {
      const synergyDef = this.data[synergyId];
      if (!synergyDef) continue;

      // 找到满足条件的最高级别
      let activeTier = null;
      for (let i = synergyDef.tiers.length - 1; i >= 0; i--) {
        if (count >= synergyDef.tiers[i].count) {
          activeTier = synergyDef.tiers[i];
          break;
        }
      }

      if (activeTier) {
        activeSynergies.push({
          id: synergyId,
          name: synergyDef.name,
          icon: synergyDef.icon,
          type: synergyDef.type,
          count,
          tier: activeTier,
          totalTiers: synergyDef.tiers.length,
        });
      }
    }

    return activeSynergies;
  }

  /**
   * 将羁绊加成应用到棋子上
   * @param {Chess[]} units - 场上的棋子列表
   * @param {Array} activeSynergies - 激活的羁绊列表
   */
  applyBonuses(units, activeSynergies) {
    // 清空所有单位的加成
    for (const unit of units) {
      unit.bonuses = {};
    }

    for (const synergy of activeSynergies) {
      const bonus = synergy.tier.bonus;
      for (const unit of units) {
        if (unit.synergies.includes(synergy.id)) {
          // 将加成叠加到棋子上
          for (const [key, value] of Object.entries(bonus)) {
            if (typeof value === 'number') {
              unit.bonuses[key] = (unit.bonuses[key] || 0) + value;
            } else {
              unit.bonuses[key] = value;
            }
          }
        }
      }
    }
  }

  /**
   * 获取羁绊显示信息
   * @param {string} synergyId
   * @returns {object|null}
   */
  getSynergyInfo(synergyId) {
    return this.data[synergyId] || null;
  }
}

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Synergy;
}
