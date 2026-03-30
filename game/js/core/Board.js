/**
 * 棋盘类 - Board
 * 管理棋盘格子和棋子位置
 */
class Board {
  /**
   * @param {number} rows - 行数
   * @param {number} cols - 列数
   */
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    // 棋盘格子, grid[row][col] = Chess | null
    this.grid = [];
    for (let r = 0; r < rows; r++) {
      this.grid[r] = new Array(cols).fill(null);
    }
  }

  /** 在指定位置放置棋子 */
  placeUnit(unit, row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
    if (this.grid[row][col] !== null) return false;
    this.grid[row][col] = unit;
    unit.row = row;
    unit.col = col;
    unit.benchIndex = -1;
    return true;
  }

  /** 移除指定位置的棋子 */
  removeUnit(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    const unit = this.grid[row][col];
    if (unit) {
      unit.row = -1;
      unit.col = -1;
    }
    this.grid[row][col] = null;
    return unit;
  }

  /** 移动棋子 */
  moveUnit(fromRow, fromCol, toRow, toCol) {
    const unit = this.removeUnit(fromRow, fromCol);
    if (!unit) return false;
    if (!this.placeUnit(unit, toRow, toCol)) {
      // 放回原位
      this.placeUnit(unit, fromRow, fromCol);
      return false;
    }
    return true;
  }

  /** 交换两个位置的棋子 */
  swapUnits(row1, col1, row2, col2) {
    const unit1 = this.grid[row1][col1];
    const unit2 = this.grid[row2][col2];
    this.grid[row1][col1] = unit2;
    this.grid[row2][col2] = unit1;
    if (unit1) { unit1.row = row2; unit1.col = col2; }
    if (unit2) { unit2.row = row1; unit2.col = col1; }
    return true;
  }

  /** 获取指定位置的棋子 */
  getUnit(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return this.grid[row][col];
  }

  /** 获取棋盘上所有棋子 */
  getAllUnits() {
    const units = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          units.push(this.grid[r][c]);
        }
      }
    }
    return units;
  }

  /** 获取棋盘上的棋子数量 */
  getUnitCount() {
    return this.getAllUnits().length;
  }

  /** 获取空格子列表 */
  getEmptyCells() {
    const cells = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c]) {
          cells.push({ row: r, col: c });
        }
      }
    }
    return cells;
  }

  /** 计算两个格子之间的距离(切比雪夫距离) */
  static distance(r1, c1, r2, c2) {
    return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
  }

  /** 查找最近的目标 */
  findNearestEnemy(unit, enemies) {
    let nearest = null;
    let minDist = Infinity;
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      const dist = Board.distance(unit.row, unit.col, enemy.row, enemy.col);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  /** 向目标移动一步 */
  moveToward(unit, targetRow, targetCol) {
    const dr = Math.sign(targetRow - unit.row);
    const dc = Math.sign(targetCol - unit.col);
    const newRow = unit.row + dr;
    const newCol = unit.col + dc;
    if (newRow >= 0 && newRow < this.rows * 2 && newCol >= 0 && newCol < this.cols) {
      if (!this.grid[newRow] || !this.grid[newRow][newCol]) {
        return this.moveUnit(unit.row, unit.col, newRow, newCol);
      }
    }
    return false;
  }

  /** 清空棋盘 */
  clear() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = null;
      }
    }
  }

  /** 创建战斗用棋盘(扩展为对战区域) */
  static createBattleBoard(playerUnits, enemyUnits, cols) {
    const totalRows = 8; // 4 rows per side
    const board = new Board(totalRows, cols);

    // 己方棋子放在0-3行
    for (const unit of playerUnits) {
      const clone = unit.clone();
      clone.resetForBattle();
      board.placeUnit(clone, unit.row, unit.col);
    }

    // 敌方棋子放在4-7行(镜像放置)
    for (const unit of enemyUnits) {
      const clone = unit.clone();
      clone.resetForBattle();
      const mirrorRow = 7 - unit.row;
      const mirrorCol = cols - 1 - unit.col;
      board.placeUnit(clone, mirrorRow, mirrorCol);
    }

    return board;
  }
}

// 支持 Node.js 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Board;
}
