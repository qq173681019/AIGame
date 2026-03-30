var synergyConfig = require('../config/synergies');
var RACE_SYNERGIES = synergyConfig.RACE_SYNERGIES;
var CLASS_SYNERGIES = synergyConfig.CLASS_SYNERGIES;

class SynergySystem {
  constructor() {
    this.activeSynergies = []; // { name, type, level, bonus, description }
  }
  
  // Calculate active synergies from hero list
  calculate(heroes) {
    this.activeSynergies = [];
    
    // Count races and classes
    var raceCounts = {};
    var classCounts = {};
    
    // Count all heroes by race/class (duplicates are intentional for synergy thresholds)
    for (var i = 0; i < heroes.length; i++) {
      var hero = heroes[i];
      raceCounts[hero.race] = (raceCounts[hero.race] || 0) + 1;
      classCounts[hero.class] = (classCounts[hero.class] || 0) + 1;
    }
    
    // Check race synergies
    var races = Object.keys(raceCounts);
    for (var r = 0; r < races.length; r++) {
      var race = races[r];
      var count = raceCounts[race];
      var synergy = RACE_SYNERGIES[race];
      if (synergy) {
        var activeLevel = null;
        for (var l = synergy.levels.length - 1; l >= 0; l--) {
          if (count >= synergy.levels[l].count) {
            activeLevel = synergy.levels[l];
            break;
          }
        }
        if (activeLevel) {
          this.activeSynergies.push({
            name: race,
            type: 'race',
            count: count,
            requiredCount: activeLevel.count,
            bonus: activeLevel.bonus,
            description: activeLevel.description
          });
        }
      }
    }
    
    // Check class synergies
    var classes = Object.keys(classCounts);
    for (var c = 0; c < classes.length; c++) {
      var cls = classes[c];
      var clsCount = classCounts[cls];
      var clsSynergy = CLASS_SYNERGIES[cls];
      if (clsSynergy) {
        var clsActiveLevel = null;
        for (var m = clsSynergy.levels.length - 1; m >= 0; m--) {
          if (clsCount >= clsSynergy.levels[m].count) {
            clsActiveLevel = clsSynergy.levels[m];
            break;
          }
        }
        if (clsActiveLevel) {
          this.activeSynergies.push({
            name: cls,
            type: 'class',
            count: clsCount,
            requiredCount: clsActiveLevel.count,
            bonus: clsActiveLevel.bonus,
            description: clsActiveLevel.description
          });
        }
      }
    }
    
    return this.activeSynergies;
  }
  
  // Apply synergy bonuses to heroes
  applyBonuses(heroes) {
    // First reset bonuses
    for (var i = 0; i < heroes.length; i++) {
      heroes[i].bonusHp = 0;
      heroes[i].bonusAttack = 0;
      heroes[i].bonusDefense = 0;
      heroes[i].bonusAttackSpeed = 0;
    }
    
    for (var s = 0; s < this.activeSynergies.length; s++) {
      var synergy = this.activeSynergies[s];
      for (var j = 0; j < heroes.length; j++) {
        var hero = heroes[j];
        var matches = (synergy.type === 'race' && hero.race === synergy.name) ||
                      (synergy.type === 'class' && hero.class === synergy.name);
        if (matches) {
          hero.applySynergyBonus(synergy.bonus);
        }
      }
    }
  }
  
  getActiveSynergies() {
    return this.activeSynergies;
  }
}

module.exports = SynergySystem;
