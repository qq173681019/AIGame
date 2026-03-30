/**
 * 游戏结果场景 - 显示胜负结果、统计数据和操作按钮
 */
var Button = require('../ui/button');

class ResultScene {
  /**
   * @param {Object} resultData - 游戏结果数据
   * @param {string} resultData.result - 'win' | 'lose'
   * @param {number} resultData.round - 存活回合数
   * @param {Object} resultData.stats - 统计数据
   * @param {Object} resultData.player - 玩家对象
   */
  constructor(resultData) {
    this.resultData = resultData || {};
    this.buttons = [];
    this._initialized = false;
  }

  /**
   * 设置结果数据
   */
  setResult(resultData) {
    this.resultData = resultData || {};
    this._initialized = false;
  }

  /**
   * 初始化UI布局
   */
  _initUI(canvasWidth, canvasHeight) {
    if (this._initialized) return;

    var centerX = canvasWidth / 2;
    var btnWidth = 200;
    var btnHeight = 45;
    var btnStartY = canvasHeight * 0.62;

    // 再来一局按钮
    this.playAgainBtn = {
      x: centerX - btnWidth / 2,
      y: btnStartY,
      width: btnWidth,
      height: btnHeight,
      text: '再来一局',
      color: '#4CAF50',
      textColor: '#FFFFFF',
      fontSize: 20
    };

    // 观看广告复活按钮（仅失败时显示）
    this.reviveBtn = {
      x: centerX - btnWidth / 2,
      y: btnStartY + 60,
      width: btnWidth,
      height: btnHeight,
      text: '观看广告复活',
      color: '#FF9800',
      textColor: '#FFFFFF',
      fontSize: 18
    };

    // 返回主页按钮
    this.homeBtn = {
      x: centerX - btnWidth / 2,
      y: btnStartY + 120,
      width: btnWidth,
      height: btnHeight,
      text: '返回主页',
      color: '#666688',
      textColor: '#FFFFFF',
      fontSize: 18
    };

    this.buttons = [this.playAgainBtn, this.reviveBtn, this.homeBtn];
    this._initialized = true;
  }

  /**
   * 处理触摸事件
   * @param {number} x
   * @param {number} y
   * @returns {string|null} 动作: 'playAgain' | 'revive' | 'goHome' | null
   */
  handleTouch(x, y) {
    if (this._hitTest(this.playAgainBtn, x, y)) {
      return 'playAgain';
    }
    if (this.resultData.result === 'lose' && this._hitTest(this.reviveBtn, x, y)) {
      return 'revive';
    }
    if (this._hitTest(this.homeBtn, x, y)) {
      return 'goHome';
    }
    return null;
  }

  /**
   * 矩形碰撞检测
   */
  _hitTest(btn, x, y) {
    if (!btn) return false;
    return x >= btn.x && x <= btn.x + btn.width &&
           y >= btn.y && y <= btn.y + btn.height;
  }

  /**
   * 渲染结果场景
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  render(ctx, canvasWidth, canvasHeight) {
    this._initUI(canvasWidth, canvasHeight);

    var result = this.resultData.result || 'lose';
    var stats = this.resultData.stats || {};
    var round = this.resultData.round || 0;
    var player = this.resultData.player || {};

    // 背景
    var gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    if (result === 'win') {
      gradient.addColorStop(0, '#1a2e1a');
      gradient.addColorStop(1, '#0a1e0a');
    } else {
      gradient.addColorStop(0, '#2e1a1a');
      gradient.addColorStop(1, '#1e0a0a');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 半透明遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    var centerX = canvasWidth / 2;

    // 结果标题
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (result === 'win') {
      // 胜利
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('🎉 胜利！', centerX, canvasHeight * 0.15);

      ctx.fillStyle = '#AACCAA';
      ctx.font = '18px Arial';
      ctx.fillText('恭喜你成功通关！', centerX, canvasHeight * 0.22);
    } else {
      // 失败
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('💀 失败', centerX, canvasHeight * 0.15);

      ctx.fillStyle = '#CCAAAA';
      ctx.font = '18px Arial';
      ctx.fillText('再接再厉，下次一定能赢！', centerX, canvasHeight * 0.22);
    }

    // 统计面板背景
    var panelX = canvasWidth * 0.15;
    var panelY = canvasHeight * 0.28;
    var panelW = canvasWidth * 0.7;
    var panelH = canvasHeight * 0.30;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = '#555555';
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // 统计标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('📊 战绩统计', centerX, panelY + 25);

    // 统计数据
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    var statX = panelX + 20;
    var statY = panelY + 55;
    var lineH = 28;

    var statItems = [
      { label: '存活回合', value: round, color: '#FFFFFF' },
      { label: '胜利场次', value: stats.totalBattlesWon || 0, color: '#44CC44' },
      { label: '失败场次', value: stats.totalBattlesLost || 0, color: '#CC4444' },
      { label: '购买英雄', value: stats.totalHeroesBought || 0, color: '#88CCFF' },
      { label: '累计金币', value: stats.totalGoldEarned || 0, color: '#FFD700' },
      { label: '最终等级', value: player.level || 1, color: '#CCAAFF' }
    ];

    for (var i = 0; i < statItems.length; i++) {
      var item = statItems[i];
      ctx.fillStyle = '#AAAAAA';
      ctx.fillText(item.label + ':', statX, statY + i * lineH);
      ctx.fillStyle = item.color;
      ctx.textAlign = 'right';
      ctx.fillText(String(item.value), panelX + panelW - 20, statY + i * lineH);
      ctx.textAlign = 'left';
    }

    // 渲染按钮
    this._renderButton(ctx, this.playAgainBtn);

    // 失败时显示复活按钮
    if (result === 'lose') {
      this._renderButton(ctx, this.reviveBtn);
    }

    this._renderButton(ctx, this.homeBtn);
  }

  /**
   * 渲染按钮
   */
  _renderButton(ctx, btn) {
    if (!btn) return;
    var x = btn.x;
    var y = btn.y;
    var w = btn.width;
    var h = btn.height;

    // 按钮阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 2, w, h);

    // 圆角矩形按钮
    ctx.fillStyle = btn.color || '#4CAF50';
    ctx.beginPath();
    var r = 6;
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
    ctx.font = (btn.fontSize || 18) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.text || '', x + w / 2, y + h / 2);
  }
}

module.exports = ResultScene;
