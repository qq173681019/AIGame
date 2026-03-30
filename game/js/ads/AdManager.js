/**
 * 广告管理器 - AdManager
 * 支持微信小游戏广告 和 Web H5 广告
 */
class AdManager {
  constructor(config) {
    this.config = config;
    this.platform = this._detectPlatform();
    this.bannerAd = null;
    this.interstitialAd = null;
    this.rewardedAd = null;
    this.isAdReady = false;
  }

  /** 检测运行平台 */
  _detectPlatform() {
    if (typeof wx !== 'undefined' && wx.createBannerAd) {
      return 'wechat';
    }
    return 'web';
  }

  /** 初始化广告 */
  init() {
    if (this.platform === 'wechat') {
      this._initWechatAds();
    } else {
      this._initWebAds();
    }
  }

  /** 初始化微信广告 */
  _initWechatAds() {
    try {
      // Banner 广告
      if (this.config.AD_UNIT_ID_BANNER) {
        this.bannerAd = wx.createBannerAd({
          adUnitId: this.config.AD_UNIT_ID_BANNER,
          adIntervals: 30,
          style: {
            left: 0,
            top: 0,
            width: 320
          }
        });
        this.bannerAd.onError((err) => {
          console.warn('[AdManager] Banner ad error:', err);
        });
        this.bannerAd.onLoad(() => {
          console.log('[AdManager] Banner ad loaded');
        });
      }

      // 插屏广告
      if (this.config.AD_UNIT_ID_INTERSTITIAL) {
        this.interstitialAd = wx.createInterstitialAd({
          adUnitId: this.config.AD_UNIT_ID_INTERSTITIAL
        });
        this.interstitialAd.onError((err) => {
          console.warn('[AdManager] Interstitial ad error:', err);
        });
      }

      // 激励视频广告
      if (this.config.AD_UNIT_ID_REWARDED) {
        this.rewardedAd = wx.createRewardedVideoAd({
          adUnitId: this.config.AD_UNIT_ID_REWARDED
        });
        this.rewardedAd.onError((err) => {
          console.warn('[AdManager] Rewarded ad error:', err);
        });
      }

      this.isAdReady = true;
    } catch (e) {
      console.warn('[AdManager] Failed to init WeChat ads:', e);
    }
  }

  /** 初始化 Web 广告 (展示广告位占位) */
  _initWebAds() {
    this.isAdReady = true;
    console.log('[AdManager] Web ad system initialized');
  }

  /** 显示 Banner 广告 */
  showBanner() {
    if (this.platform === 'wechat' && this.bannerAd) {
      this.bannerAd.show().catch(err => {
        console.warn('[AdManager] Failed to show banner:', err);
      });
    } else {
      this._showWebBanner();
    }
  }

  /** 隐藏 Banner 广告 */
  hideBanner() {
    if (this.platform === 'wechat' && this.bannerAd) {
      this.bannerAd.hide();
    } else {
      this._hideWebBanner();
    }
  }

  /** 显示插屏广告 */
  showInterstitial() {
    if (this.platform === 'wechat' && this.interstitialAd) {
      this.interstitialAd.show().catch(err => {
        console.warn('[AdManager] Failed to show interstitial:', err);
      });
    } else {
      this._showWebInterstitial();
    }
  }

  /** 显示激励视频广告 */
  showRewarded(onReward, onClose) {
    if (this.platform === 'wechat' && this.rewardedAd) {
      this.rewardedAd.onClose((res) => {
        if (res && res.isEnded) {
          if (onReward) onReward();
        } else {
          if (onClose) onClose();
        }
      });
      this.rewardedAd.show().catch(() => {
        this.rewardedAd.load().then(() => this.rewardedAd.show());
      });
    } else {
      this._showWebRewarded(onReward, onClose);
    }
  }

  /** Web Banner 广告展示 */
  _showWebBanner() {
    let container = document.getElementById(this.config.WEB_AD_SLOT);
    if (!container) {
      container = document.createElement('div');
      container.id = this.config.WEB_AD_SLOT;
      container.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        background: linear-gradient(135deg, #1a1a2e, #2d2d44);
        border-top: 2px solid #ffd700;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffd700;
        font-size: 14px;
        font-family: sans-serif;
        z-index: 1000;
      `;
      container.innerHTML = '📢 广告位 - Ad Banner Placeholder | 接入您的广告SDK';
      document.body.appendChild(container);
    }
    container.style.display = 'flex';
  }

  /** 隐藏 Web Banner */
  _hideWebBanner() {
    const container = document.getElementById(this.config.WEB_AD_SLOT);
    if (container) {
      container.style.display = 'none';
    }
  }

  /** Web 插屏广告展示 */
  _showWebInterstitial() {
    const overlay = document.createElement('div');
    overlay.id = 'ad-interstitial-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); display: flex; align-items: center;
      justify-content: center; z-index: 2000; flex-direction: column;
    `;
    overlay.innerHTML = `
      <div style="background: #2d2d44; border: 2px solid #ffd700; border-radius: 12px;
        padding: 40px; text-align: center; color: white; max-width: 300px;">
        <p style="font-size: 18px; margin-bottom: 20px;">📺 插屏广告位</p>
        <p style="font-size: 14px; color: #aaa; margin-bottom: 20px;">Interstitial Ad Placeholder</p>
        <button onclick="this.parentElement.parentElement.remove()"
          style="background: #ffd700; color: #1a1a2e; border: none; padding: 10px 30px;
          border-radius: 6px; font-size: 16px; cursor: pointer;">关闭</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // 5秒后自动关闭
    setTimeout(() => {
      if (document.getElementById('ad-interstitial-overlay')) {
        overlay.remove();
      }
    }, 5000);
  }

  /** Web 激励视频广告展示 */
  _showWebRewarded(onReward, onClose) {
    const overlay = document.createElement('div');
    overlay.id = 'ad-rewarded-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.9); display: flex; align-items: center;
      justify-content: center; z-index: 2000; flex-direction: column;
    `;
    overlay.innerHTML = `
      <div style="background: #2d2d44; border: 2px solid #ffd700; border-radius: 12px;
        padding: 40px; text-align: center; color: white; max-width: 300px;">
        <p style="font-size: 18px; margin-bottom: 10px;">🎬 激励视频广告</p>
        <p style="font-size: 14px; color: #aaa; margin-bottom: 10px;">Rewarded Video Placeholder</p>
        <p id="ad-countdown" style="font-size: 24px; color: #ffd700; margin-bottom: 20px;">5</p>
        <p style="font-size: 12px; color: #888;">观看完毕后获得奖励</p>
      </div>
    `;
    document.body.appendChild(overlay);

    let countdown = 5;
    const countdownEl = overlay.querySelector('#ad-countdown');
    const timer = setInterval(() => {
      countdown--;
      if (countdownEl) countdownEl.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(timer);
        overlay.remove();
        if (onReward) onReward();
      }
    }, 1000);
  }

  /** 销毁所有广告实例 */
  destroy() {
    if (this.bannerAd) {
      this.bannerAd.destroy();
      this.bannerAd = null;
    }
    if (this.interstitialAd) {
      this.interstitialAd = null;
    }
    if (this.rewardedAd) {
      this.rewardedAd = null;
    }
  }
}

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdManager;
}
