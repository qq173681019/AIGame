/**
 * 精灵基类 - Base Sprite Class
 */
class Sprite {
  constructor(x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.visible = true;
    this.alpha = 1;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.color = '#ffffff';
    this.children = [];
    this.parent = null;
  }

  addChild(child) {
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      child.parent = null;
      this.children.splice(index, 1);
    }
  }

  /**
   * Check if point (px, py) is inside this sprite
   */
  containsPoint(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  update(dt) {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update(dt);
    }
  }

  render(ctx) {
    if (!this.visible) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    this.draw(ctx);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].render(ctx);
    }
    ctx.restore();
  }

  draw(ctx) {
    // Override in subclass
  }

  destroy() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.children = [];
  }
}

module.exports = Sprite;
