/**
 * ShopUI — 底部商店面板
 * 展示 5 张英雄卡 + 刷新按钮 + 购买经验按钮
 */

var GameConfig = require('../config/game-config');
var Button = require('./button');
var COLORS = GameConfig.COLORS;

var COST_COLORS = {
  1: COLORS.COST_1,
  2: COLORS.COST_2,
  3: COLORS.COST_3,
  4: COLORS.COST_4,
  5: COLORS.COST_5
};

// 布局常量
var PANEL_TOP = 960;
var PANEL_PAD_X = 20;
var CARD_GAP = 10;
var CARD_WIDTH = Math.floor(
  (GameConfig.DESIGN_WIDTH - PANEL_PAD_X * 2 - CARD_GAP * (GameConfig.SHOP_SLOTS - 1)) /
  GameConfig.SHOP_SLOTS
);
var CARD_HEIGHT = 170;
var CARD_RADIUS = 10;

var BTN_TOP = PANEL_TOP + CARD_HEIGHT + 16;
var BTN_HEIGHT = 52;
var BTN_GAP = 20;
var BTN_WIDTH = Math.floor((GameConfig.DESIGN_WIDTH - PANEL_PAD_X * 2 - BTN_GAP) / 2);

function ShopUI() {
  this.offers = []; // 当前商店英雄配置列表（最多 5 个）
  this.visible = true;

  // 底部操作按钮
  this.refreshBtn = new Button({
    x: PANEL_PAD_X,
    y: BTN_TOP,
    width: BTN_WIDTH,
    height: BTN_HEIGHT,
    text: '🔄 刷新 (' + GameConfig.REFRESH_COST + '金)',
    fontSize: 24,
    color: '#3a7bd5',
    textColor: COLORS.TEXT_WHITE,
    borderColor: '#5b9bef',
    cornerRadius: 10
  });

  this.buyXpBtn = new Button({
    x: PANEL_PAD_X + BTN_WIDTH + BTN_GAP,
    y: BTN_TOP,
    width: BTN_WIDTH,
    height: BTN_HEIGHT,
    text: '📈 买经验 (' + GameConfig.XP_COST + '金)',
    fontSize: 24,
    color: '#d4a017',
    textColor: COLORS.TEXT_WHITE,
    borderColor: '#f0c040',
    cornerRadius: 10
  });
}

/**
 * 更新商店展示的英雄列表
 * @param {Array} shopOffers - 英雄配置对象数组
 */
ShopUI.prototype.updateOffers = function (shopOffers) {
  this.offers = shopOffers || [];
};

/**
 * 处理触摸并返回操作信息
 * @returns {{action:string, index:number}|null}
 */
ShopUI.prototype.handleTouch = function (px, py) {
  if (!this.visible) return null;

  // 检查英雄卡点击
  for (var i = 0; i < this.offers.length; i++) {
    var cx = PANEL_PAD_X + i * (CARD_WIDTH + CARD_GAP);
    var cy = PANEL_TOP;
    if (px >= cx && px <= cx + CARD_WIDTH && py >= cy && py <= cy + CARD_HEIGHT) {
      return { action: 'buy', index: i };
    }
  }

  // 刷新按钮
  if (this.refreshBtn.containsPoint(px, py) && this.refreshBtn.enabled) {
    return { action: 'refresh', index: -1 };
  }

  // 买经验按钮
  if (this.buyXpBtn.containsPoint(px, py) && this.buyXpBtn.enabled) {
    return { action: 'buyXp', index: -1 };
  }

  return null;
};

// ── 绘制辅助 ───────────────────────────────────────────────

function _roundRect(ctx, x, y, w, h, r) {
  if (r > h / 2) r = h / 2;
  if (r > w / 2) r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ── 主渲染 ─────────────────────────────────────────────────

ShopUI.prototype.render = function (ctx) {
  if (!this.visible) return;

  ctx.save();

  // 面板背景
  var panelY = PANEL_TOP - 12;
  var panelH = CARD_HEIGHT + BTN_HEIGHT + 50;
  ctx.fillStyle = COLORS.PANEL_BG;
  ctx.fillRect(0, panelY, GameConfig.DESIGN_WIDTH, panelH);

  // 顶部分割线
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, panelY);
  ctx.lineTo(GameConfig.DESIGN_WIDTH, panelY);
  ctx.stroke();

  // 绘制英雄卡
  for (var i = 0; i < GameConfig.SHOP_SLOTS; i++) {
    var hero = this.offers[i] || null;
    this._drawCard(ctx, i, hero);
  }

  // 按钮
  this.refreshBtn.render(ctx);
  this.buyXpBtn.render(ctx);

  ctx.restore();
};

/**
 * 绘制单张英雄卡
 */
ShopUI.prototype._drawCard = function (ctx, index, hero) {
  var cx = PANEL_PAD_X + index * (CARD_WIDTH + CARD_GAP);
  var cy = PANEL_TOP;

  if (!hero) {
    // 空卡位
    _roundRect(ctx, cx, cy, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    return;
  }

  var cost = hero.cost || 1;
  var tierColor = COST_COLORS[cost] || COST_COLORS[1];

  // 卡片背景 —— 渐变感
  _roundRect(ctx, cx, cy, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  ctx.fillStyle = '#1e1e30';
  ctx.fill();

  // 顶部费用色带
  var bandH = 6;
  _roundRect(ctx, cx, cy, CARD_WIDTH, bandH + CARD_RADIUS, CARD_RADIUS);
  ctx.fillStyle = tierColor;
  ctx.fill();
  // 覆盖下半圆角
  ctx.fillRect(cx, cy + bandH, CARD_WIDTH, CARD_RADIUS);

  // 边框
  _roundRect(ctx, cx, cy, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  ctx.strokeStyle = tierColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 英雄名称
  ctx.fillStyle = COLORS.TEXT_WHITE;
  ctx.font = 'bold 22px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hero.name || '???', cx + CARD_WIDTH / 2, cy + 38);

  // 种族 / 职业
  ctx.font = '18px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText((hero.race || '') + ' · ' + (hero.class || ''), cx + CARD_WIDTH / 2, cy + 68);

  // 费用圆形徽标
  var badgeR = 16;
  var badgeX = cx + CARD_WIDTH / 2;
  var badgeY = cy + 105;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = tierColor;
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('' + cost, badgeX, badgeY);

  // 金币标签
  ctx.fillStyle = COLORS.GOLD;
  ctx.font = '16px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('💰' + cost, cx + CARD_WIDTH / 2, cy + CARD_HEIGHT - 20);

  ctx.textAlign = 'left';
};

module.exports = ShopUI;
