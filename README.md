# ⚔️ 自走棋大战 - Auto Chess Battle

一款基于 HTML5 Canvas 的自走棋游戏，灵感来源于金铲铲之战/云顶之弈。支持**微信小游戏**平台和 **Web 浏览器**运行，已集成**展示广告**系统。

## 🎮 游戏特性

- **自走棋核心玩法**: 购买棋子、布置阵容、自动战斗
- **20 种棋子**: 从1费到5费，涵盖战士、法师、游侠、刺客、守护者等职业
- **16 种羁绊**: 包含职业和种族羁绊，达到指定数量自动激活
- **星级合成**: 3个相同棋子自动合成升星，属性大幅提升
- **商店系统**: 刷新、锁定、购买经验等完整商店功能
- **AI 对手**: 随回合增长的敌方阵容
- **展示广告**: Banner 广告、插屏广告、激励视频广告

## 🏗️ 项目结构

```
├── game/                      # 游戏主体
│   ├── index.html             # Web 入口页面
│   ├── css/style.css          # 样式
│   ├── js/
│   │   ├── config.js          # 游戏配置
│   │   ├── main.js            # 主入口
│   │   ├── core/              # 核心模块
│   │   │   ├── GameEngine.js  # 游戏引擎
│   │   │   ├── Board.js       # 棋盘
│   │   │   ├── Chess.js       # 棋子
│   │   │   ├── Player.js      # 玩家
│   │   │   ├── Shop.js        # 商店
│   │   │   ├── Battle.js      # 战斗系统
│   │   │   └── Synergy.js     # 羁绊系统
│   │   ├── data/              # 数据定义
│   │   │   ├── champions.js   # 棋子数据
│   │   │   └── synergies.js   # 羁绊数据
│   │   ├── ui/
│   │   │   └── UIManager.js   # Canvas 渲染
│   │   └── ads/
│   │       └── AdManager.js   # 广告管理器
├── wechat/                    # 微信小游戏适配
│   ├── game.js                # 微信入口
│   ├── game.json              # 游戏配置
│   └── project.config.json    # 项目配置
├── tests/
│   └── game.test.js           # 单元测试 (49个)
└── package.json
```

## 🚀 快速开始

### Web 浏览器运行

```bash
# 方式1: 使用 http-server
npm start

# 方式2: 使用 Python
cd game && python3 -m http.server 8080

# 方式3: 直接打开
# 用浏览器打开 game/index.html
```

### 微信小游戏

1. 下载安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 将 `game/js/` 目录复制到 `wechat/` 目录下
3. 用微信开发者工具打开 `wechat/` 目录
4. 在 `project.config.json` 中配置你的 `appid`
5. 在 `config.js` 中配置广告位 ID

### 运行测试

```bash
npm test
```

## 📺 广告接入

### 微信小游戏广告

在 `game/js/config.js` 中配置:

```javascript
AD_UNIT_ID_BANNER: 'your-banner-ad-unit-id',
AD_UNIT_ID_INTERSTITIAL: 'your-interstitial-ad-unit-id',
AD_UNIT_ID_REWARDED: 'your-rewarded-ad-unit-id',
```

支持的广告类型:
- **Banner 广告**: 底部常驻展示
- **插屏广告**: 每3回合展示一次
- **激励视频广告**: 游戏结束后可观看复活

### Web 广告

Web 平台使用占位广告，可替换为任意广告 SDK (如 Google AdSense)。

## 🎯 游戏操作

| 操作 | 说明 |
|------|------|
| 点击商店棋子 | 购买棋子到备战席 |
| 点击备战席 → 点击棋盘 | 放置棋子上场 |
| 点击棋盘棋子 → 点击空格 | 移动棋子位置 |
| 长按备战席棋子 | 出售棋子 |
| 刷新按钮 | 花费2金币刷新商店 |
| 买经验按钮 | 花费4金币获得4经验 |
| 开始战斗 | 进入自动战斗阶段 |

## 🔧 技术栈

- **渲染**: HTML5 Canvas 2D
- **语言**: 原生 JavaScript (ES5+ 兼容)
- **平台适配**: 微信小游戏 API + Web 标准 API
- **广告**: 微信广告 SDK + Web 广告占位
- **测试**: Node.js assert 模块

## 📋 棋子一览

| 费用 | 棋子 | 职业 | 种族 |
|------|------|------|------|
| 1💰 | ⚔️ 铁甲战士 | 战士 | 钢铁 |
| 1💰 | 🏹 精灵射手 | 游侠 | 精灵 |
| 1💰 | 🔥 学徒法师 | 法师 | 人类 |
| 1💰 | 🛡️ 石甲卫士 | 守护者 | 岩石 |
| 1💰 | 🗡️ 暗影刺客 | 刺客 | 暗影 |
| 2💰 | 🪓 狂战士 | 战士 | 狂战 |
| 2💰 | ❄️ 冰霜女巫 | 法师 | 冰霜 |
| 2💰 | 🦅 猎鹰游侠 | 游侠 | 野兽 |
| 2💰 | ⚜️ 圣光骑士 | 守护者 | 光明 |
| 2💰 | 🥷 幻影忍者 | 刺客 | 忍者 |
| 3💰 | 🐉 龙骑将军 | 战士 | 龙族 |
| 3💰 | ⚡ 雷电法王 | 法师 | 雷电 |
| 3💰 | 🌪️ 风暴游侠 | 游侠 | 疾风 |
| 3💰 | 😈 血影魔刃 | 刺客 | 恶魔 |
| 4💰 | 👑 天神战将 | 战士 | 神圣 |
| 4💰 | 🔮 凤凰法师 | 法师 | 凤凰 |
| 4💰 | 🏰 不朽圣盾 | 守护者 | 神圣 |
| 5💰 | 💀 混沌魔神 | 战士 | 恶魔/神圣 |
| 5💰 | 🌟 星辰大法师 | 法师 | 精灵/光明 |
| 5💰 | 👻 虚空之影 | 刺客 | 暗影/忍者 |

## 📄 License

MIT