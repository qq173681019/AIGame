/**
 * 游戏配置 - Game Configuration
 */
const GameConfig = {
  // 画布尺寸
  CANVAS_WIDTH: 750,
  CANVAS_HEIGHT: 1334,

  // 棋盘配置
  BOARD_ROWS: 4,       // 己方可放置行数
  BOARD_COLS: 7,       // 列数
  CELL_SIZE: 90,       // 格子尺寸
  BOARD_OFFSET_X: 35,  // 棋盘起始X偏移
  BOARD_OFFSET_Y: 300, // 棋盘起始Y偏移

  // 备战席
  BENCH_SLOTS: 9,
  BENCH_OFFSET_X: 35,
  BENCH_OFFSET_Y: 720,

  // 商店配置
  SHOP_SLOTS: 5,
  REFRESH_COST: 2,
  BUY_XP_COST: 4,
  XP_PER_BUY: 4,

  // 玩家配置
  STARTING_GOLD: 10,
  STARTING_HP: 100,
  MAX_LEVEL: 9,
  INTEREST_RATE: 0.1,
  MAX_INTEREST: 5,

  // 关卡经验需求 (索引=当前等级, 值=升级所需经验)
  XP_TO_LEVEL: [0, 0, 2, 6, 10, 20, 36, 56, 80, 100],

  // 各等级上场棋子数
  UNITS_PER_LEVEL: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],

  // 商店刷新概率 (行=玩家等级, 列=棋子费用1-5)
  SHOP_ODDS: [
    [],
    [1.00, 0.00, 0.00, 0.00, 0.00], // Lv1
    [1.00, 0.00, 0.00, 0.00, 0.00], // Lv2
    [0.75, 0.25, 0.00, 0.00, 0.00], // Lv3
    [0.55, 0.30, 0.15, 0.00, 0.00], // Lv4
    [0.45, 0.33, 0.20, 0.02, 0.00], // Lv5
    [0.30, 0.33, 0.25, 0.10, 0.02], // Lv6
    [0.19, 0.30, 0.28, 0.20, 0.03], // Lv7
    [0.15, 0.20, 0.28, 0.25, 0.12], // Lv8
    [0.10, 0.15, 0.25, 0.30, 0.20], // Lv9
  ],

  // 同名棋子合成所需数量
  UNITS_TO_UPGRADE: 3,

  // 战斗配置
  BATTLE_TICK_MS: 500,   // 战斗tick间隔(ms)
  ATTACK_RANGE_MELEE: 1,
  ATTACK_RANGE_RANGED: 3,

  // 回合阶段时间(秒)
  PHASE_PREP_TIME: 30,
  PHASE_BATTLE_TIME: 60,

  // 广告配置
  AD_UNIT_ID_BANNER: '',       // 微信 Banner 广告位 ID
  AD_UNIT_ID_INTERSTITIAL: '', // 微信 插屏广告位 ID
  AD_UNIT_ID_REWARDED: '',     // 微信 激励视频广告位 ID
  WEB_AD_SLOT: 'auto-chess-ad-banner', // Web 广告容器ID

  // 颜色主题
  COLORS: {
    BACKGROUND: '#1a1a2e',
    BOARD_LIGHT: '#2d2d44',
    BOARD_DARK: '#252540',
    BOARD_HIGHLIGHT: '#4a4a6a',
    BENCH_BG: '#1e1e35',
    GOLD: '#ffd700',
    HP_GREEN: '#4caf50',
    HP_RED: '#f44336',
    MANA_BLUE: '#2196f3',
    TEXT_WHITE: '#ffffff',
    TEXT_GRAY: '#aaaaaa',
    COST_1: '#808080',
    COST_2: '#2e7d32',
    COST_3: '#1565c0',
    COST_4: '#6a1b9a',
    COST_5: '#ff8f00',
  }
};

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameConfig;
}
