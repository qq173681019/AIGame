/**
 * 广告管理器 - 管理微信小游戏广告（横幅广告、激励视频广告、插屏广告）
 */
var EventEmitter = require('../base/event-emitter');

class AdManager extends EventEmitter {
  /**
   * @param {Object} adConfig - 广告配置
   * @param {string} adConfig.bannerId - 横幅广告单元ID
   * @param {string} adConfig.videoId - 激励视频广告单元ID
   * @param {string} adConfig.interstitialId - 插屏广告单元ID
   */
  constructor(adConfig) {
    super();
    this.config = adConfig || {};
    // 广告实例
    this.bannerAd = null;
    this.videoAd = null;
    this.interstitialAd = null;
    // 广告就绪状态
    this.isReady = { banner: false, video: false, interstitial: false };
    // 广告展示次数统计
    this.showCount = { banner: 0, video: 0, interstitial: 0 };
    // 上次展示时间戳
    this.lastShowTime = { banner: 0, video: 0, interstitial: 0 };
    // 广告冷却时间（毫秒）
    this.cooldowns = { banner: 0, video: 30000, interstitial: 60000 };
  }

  /**
   * 初始化所有广告实例
   */
  init() {
    // 检查wx API是否可用（开发环境可能不存在）
    if (typeof wx === 'undefined') {
      console.log('[AdManager] wx API不可用，广告功能已禁用');
      return;
    }
    this._initBanner();
    this._initRewardedVideo();
    this._initInterstitial();
  }

  /**
   * 初始化横幅广告
   */
  _initBanner() {
    if (!wx.createBannerAd || !this.config.bannerId) return;
    try {
      var systemInfo = wx.getSystemInfoSync();
      this.bannerAd = wx.createBannerAd({
        adUnitId: this.config.bannerId,
        adIntervals: 30,
        style: {
          left: 0,
          top: systemInfo.windowHeight - 100,
          width: systemInfo.windowWidth
        }
      });
      var self = this;
      this.bannerAd.onLoad(function() {
        self.isReady.banner = true;
        console.log('[AdManager] 横幅广告加载成功');
      });
      this.bannerAd.onError(function(err) {
        console.log('[AdManager] 横幅广告加载失败:', err);
        self.isReady.banner = false;
      });
      // 横幅广告尺寸自适应居中
      this.bannerAd.onResize(function(size) {
        self.bannerAd.style.top = systemInfo.windowHeight - size.height;
        self.bannerAd.style.left = (systemInfo.windowWidth - size.width) / 2;
      });
    } catch (e) {
      console.log('[AdManager] 横幅广告初始化异常:', e);
    }
  }

  /**
   * 初始化激励视频广告
   */
  _initRewardedVideo() {
    if (!wx.createRewardedVideoAd || !this.config.videoId) return;
    try {
      this.videoAd = wx.createRewardedVideoAd({ adUnitId: this.config.videoId });
      var self = this;
      this.videoAd.onLoad(function() {
        self.isReady.video = true;
        console.log('[AdManager] 激励视频广告加载成功');
      });
      this.videoAd.onError(function(err) {
        console.log('[AdManager] 激励视频广告加载失败:', err);
        self.isReady.video = false;
      });
    } catch (e) {
      console.log('[AdManager] 激励视频广告初始化异常:', e);
    }
  }

  /**
   * 初始化插屏广告
   */
  _initInterstitial() {
    if (!wx.createInterstitialAd || !this.config.interstitialId) return;
    try {
      this.interstitialAd = wx.createInterstitialAd({ adUnitId: this.config.interstitialId });
      var self = this;
      this.interstitialAd.onLoad(function() {
        self.isReady.interstitial = true;
        console.log('[AdManager] 插屏广告加载成功');
      });
      this.interstitialAd.onError(function(err) {
        console.log('[AdManager] 插屏广告加载失败:', err);
        self.isReady.interstitial = false;
      });
    } catch (e) {
      console.log('[AdManager] 插屏广告初始化异常:', e);
    }
  }

  /**
   * 显示横幅广告
   * @returns {boolean} 是否成功显示
   */
  showBanner() {
    if (!this.bannerAd || !this.isReady.banner) return false;
    try {
      this.bannerAd.show();
      this.showCount.banner++;
      this.lastShowTime.banner = Date.now();
      return true;
    } catch (e) {
      console.log('[AdManager] 显示横幅广告失败:', e);
      return false;
    }
  }

  /**
   * 隐藏横幅广告
   */
  hideBanner() {
    if (!this.bannerAd) return;
    try { this.bannerAd.hide(); } catch (e) { /* 忽略隐藏错误 */ }
  }

  /**
   * 显示激励视频广告
   * @param {Function} onComplete - 回调函数，参数为是否完整观看(boolean)
   * @returns {boolean} 是否成功发起播放
   */
  showRewardedVideo(onComplete) {
    var now = Date.now();
    // 检查冷却时间
    if (now - this.lastShowTime.video < this.cooldowns.video) {
      console.log('[AdManager] 激励视频广告冷却中');
      return false;
    }
    if (!this.videoAd) {
      if (onComplete) onComplete(false);
      return false;
    }
    var self = this;
    // 尝试播放，失败则重新加载后再播放
    this.videoAd.show().catch(function() {
      self.videoAd.load().then(function() { self.videoAd.show(); });
    });
    // 监听关闭事件，判断是否完整观看
    this.videoAd.onClose(function closeHandler(res) {
      self.videoAd.offClose(closeHandler);
      var rewarded = res && res.isEnded;
      if (onComplete) onComplete(rewarded);
      if (rewarded) {
        self.showCount.video++;
        self.lastShowTime.video = Date.now();
        self.emit('videoRewarded');
      }
    });
    return true;
  }

  /**
   * 显示插屏广告
   * @returns {boolean} 是否成功显示
   */
  showInterstitial() {
    var now = Date.now();
    // 检查冷却时间
    if (now - this.lastShowTime.interstitial < this.cooldowns.interstitial) return false;
    if (!this.interstitialAd) return false;
    try {
      this.interstitialAd.show();
      this.showCount.interstitial++;
      this.lastShowTime.interstitial = Date.now();
      return true;
    } catch (e) {
      console.log('[AdManager] 显示插屏广告失败:', e);
      return false;
    }
  }

  /**
   * 检查指定广告类型是否可用
   * @param {string} type - 广告类型: 'banner' | 'video' | 'interstitial'
   * @returns {boolean}
   */
  isAdReady(type) {
    return !!this.isReady[type];
  }

  /**
   * 获取广告展示统计
   * @returns {Object}
   */
  getStats() {
    return {
      showCount: Object.assign({}, this.showCount),
      lastShowTime: Object.assign({}, this.lastShowTime)
    };
  }

  /**
   * 销毁所有广告实例，释放资源
   */
  destroy() {
    if (this.bannerAd) { try { this.bannerAd.destroy(); } catch(e) {} }
    if (this.videoAd) { try { this.videoAd.destroy(); } catch(e) {} }
    if (this.interstitialAd) { try { this.interstitialAd.destroy(); } catch(e) {} }
    this.bannerAd = null;
    this.videoAd = null;
    this.interstitialAd = null;
    this.isReady = { banner: false, video: false, interstitial: false };
  }
}

module.exports = AdManager;
