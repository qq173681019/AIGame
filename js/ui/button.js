/**
 * Button — 通用按钮组件
 * 使用 Canvas 绘制圆角矩形按钮，支持点击回调
 */

var GameConfig = require('../config/game-config');
var COLORS = GameConfig.COLORS;

/**
 * @param {Object} options
 * @param {number} options.x - 左上角 x
 * @param {number} options.y - 左上角 y
 * @param {number} options.width
 * @param {number} options.height
 * @param {string} options.text
 * @param {number} [options.fontSize=28]
 * @param {string} [options.color]        - 背景色
 * @param {string} [options.textColor]    - 文字色
 * @param {string} [options.borderColor]  - 描边色
 * @param {string} [options.disabledColor]- 禁用态背景色
 * @param {number} [options.cornerRadius=12]
 * @param {Function} [options.onClick]
 */
function Button(options) {
  this.x = options.x || 0;
  this.y = options.y || 0;
  this.width = options.width || 160;
  this.height = options.height || 60;
  this.text = options.text || '';
  this.fontSize = options.fontSize || 28;
  this.color = options.color || '#4a90d9';
  this.textColor = options.textColor || COLORS.TEXT_WHITE;
  this.borderColor = options.borderColor || null;
  this.disabledColor = options.disabledColor || '#666666';
  this.cornerRadius = options.cornerRadius !== undefined ? options.cornerRadius : 12;
  this.onClick = options.onClick || null;

  this.visible = true;
  this.enabled = true;
}

/**
 * 判断坐标是否落在按钮区域内
 */
Button.prototype.containsPoint = function (px, py) {
  return (
    px >= this.x &&
    px <= this.x + this.width &&
    py >= this.y &&
    py <= this.y + this.height
  );
};

/**
 * 处理触摸事件，若命中且可用则执行 onClick
 * @returns {boolean} 是否命中
 */
Button.prototype.handleTouch = function (px, py) {
  if (!this.visible || !this.enabled) return false;
  if (this.containsPoint(px, py)) {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }
    return true;
  }
  return false;
};

/**
 * 绘制圆角矩形路径（辅助方法）
 */
Button.prototype._roundRect = function (ctx, x, y, w, h, r) {
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
};

/**
 * 渲染按钮
 */
Button.prototype.render = function (ctx) {
  if (!this.visible) return;

  ctx.save();

  var bgColor = this.enabled ? this.color : this.disabledColor;

  // 绘制圆角背景
  this._roundRect(ctx, this.x, this.y, this.width, this.height, this.cornerRadius);
  ctx.fillStyle = bgColor;
  ctx.fill();

  // 描边
  if (this.borderColor) {
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 绘制文字（居中）
  var txtColor = this.enabled ? this.textColor : '#999999';
  ctx.fillStyle = txtColor;
  ctx.font = 'bold ' + this.fontSize + 'px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);

  ctx.restore();
};

module.exports = Button;
