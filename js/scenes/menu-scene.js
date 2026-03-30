/**
 * 主菜单场景 - 显示游戏标题和操作按钮
 */
var Button = require('../ui/button');

class MenuScene {
  constructor() {
    // 按钮列表
    this.buttons = [];
    this._initialized = false;
  }

  /**
   * 初始化场景UI（需要画布尺寸）
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  _initUI(canvasWidth, canvasHeight) {
    if (this._initialized) return;

    var centerX = canvasWidth / 2;
    var btnWidth = 200;
    var btnHeight = 50;

    // 开始游戏按钮
    this.startBtn = new Button({
      x: centerX - btnWidth / 2,
      y: canvasHeight * 0.5,
      width: btnWidth,
      height: btnHeight,
      text: '开始游戏',
      color: '#4CAF50',
      textColor: '#FFFFFF',
      fontSize: 22
    });

    // 观看广告按钮
    this.adBtn = new Button({
      x: centerX - btnWidth / 2,
      y: canvasHeight * 0.5 + 80,
      width: btnWidth,
      height: btnHeight,
      text: '观看广告获取奖励',
      color: '#FF9800',
      textColor: '#FFFFFF',
      fontSize: 18
    });

    this.buttons = [this.startBtn, this.adBtn];
    this._initialized = true;
  }

  /**
   * 处理触摸事件
   * @param {number} x
   * @param {number} y
   * @returns {string|null} 动作字符串: 'startGame' | 'watchAd' | null
   */
  handleTouch(x, y) {
    if (this.startBtn && this.startBtn.contains && this.startBtn.contains(x, y)) {
      return 'startGame';
    }
    if (this.adBtn && this.adBtn.contains && this.adBtn.contains(x, y)) {
      return 'watchAd';
    }
    // 兼容：按钮可能没有contains方法，手动检测
    if (this.startBtn && this._hitTest(this.startBtn, x, y)) {
      return 'startGame';
    }
    if (this.adBtn && this._hitTest(this.adBtn, x, y)) {
      return 'watchAd';
    }
    return null;
  }

  /**
   * 矩形点击检测
   */
  _hitTest(btn, x, y) {
    var bx = btn.x || 0;
    var by = btn.y || 0;
    var bw = btn.width || 0;
    var bh = btn.height || 0;
    return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
  }

  /**
   * 渲染主菜单
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  render(ctx, canvasWidth, canvasHeight) {
    this._initUI(canvasWidth, canvasHeight);

    // 背景渐变
    var gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 装饰：棋盘格背景
    ctx.globalAlpha = 0.05;
    var gridSize = 40;
    for (var gx = 0; gx < canvasWidth; gx += gridSize) {
      for (var gy = 0; gy < canvasHeight; gy += gridSize) {
        if ((gx / gridSize + gy / gridSize) % 2 === 0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(gx, gy, gridSize, gridSize);
        }
      }
    }
    ctx.globalAlpha = 1.0;

    // 游戏标题
    var centerX = canvasWidth / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 标题阴影
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 42px Arial';
    ctx.fillText('自走棋大师', centerX + 2, canvasHeight * 0.25 + 2);

    // 标题主体
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 42px Arial';
    ctx.fillText('自走棋大师', centerX, canvasHeight * 0.25);

    // 副标题
    ctx.fillStyle = '#AAAACC';
    ctx.font = '18px Arial';
    ctx.fillText('Auto Chess Master', centerX, canvasHeight * 0.25 + 45);

    // 版本号
    ctx.fillStyle = '#666688';
    ctx.font = '12px Arial';
    ctx.fillText('v1.0.0', centerX, canvasHeight * 0.25 + 70);

    // 渲染开始游戏按钮
    this._renderButton(ctx, this.startBtn);

    // 渲染广告按钮
    this._renderButton(ctx, this.adBtn);

    // 底部提示
    ctx.fillStyle = '#666688';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('策略对战 · 自动战斗 · 英雄养成', centerX, canvasHeight - 30);
  }

  /**
   * 渲染按钮
   */
  _renderButton(ctx, btn) {
    if (!btn) return;
    var x = btn.x || 0;
    var y = btn.y || 0;
    var w = btn.width || 200;
    var h = btn.height || 50;

    // 按钮阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 3, y + 3, w, h);

    // 按钮背景（圆角矩形）
    ctx.fillStyle = btn.color || '#4CAF50';
    ctx.beginPath();
    var r = 8;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // 按钮文字
    ctx.fillStyle = btn.textColor || '#FFFFFF';
    ctx.font = (btn.fontSize || 20) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.text || '', x + w / 2, y + h / 2);
  }
}

module.exports = MenuScene;
