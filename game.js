// 星座定义表，id 即为正确位置索引（0-11）
const ZODIACS = [
  { id: 0,  name: '白羊', symbol: '♈' },
  { id: 1,  name: '金牛', symbol: '♉' },
  { id: 2,  name: '双子', symbol: '♊' },
  { id: 3,  name: '巨蟹', symbol: '♋' },
  { id: 4,  name: '狮子', symbol: '♌' },
  { id: 5,  name: '室女', symbol: '♍' },
  { id: 6,  name: '天秤', symbol: '♎' },
  { id: 7,  name: '天蝎', symbol: '♏' },
  { id: 8,  name: '人马', symbol: '♐' },
  { id: 9,  name: '摩羯', symbol: '♑' },
  { id: 10, name: '宝瓶', symbol: '♒' },
  { id: 11, name: '双鱼', symbol: '♓' },
];

const COLS = 4;

// 初始盘面：board[位置] = 星座id
// 位置0:狮子(4), 位置1:双鱼(11), 位置2:双子(2), 位置3:天蝎(7)
// 位置4:摩羯(9), 位置5:白羊(0),  位置6:天秤(6), 位置7:巨蟹(3)
// 位置8:人马(8),  位置9:室女(5),  位置10:宝瓶(10), 位置11:金牛(1)
const INITIAL_BOARD = [4, 11, 2, 7, 9, 0, 6, 3, 8, 5, 10, 1];
const INITIAL_CHALLENGES = 13;
const INITIAL_POINTS = 999;
const ADD_CHALLENGE_COST = 5;

const state = {
  board: [],
  challenges: 0,
  selectedIndex: -1,
  gameOver: false,
  points: 0,
};

// DOM 引用
const gridEl = document.getElementById('grid');
const challengesEl = document.getElementById('challenges');
const clearedEl = document.getElementById('cleared');
const hintEl = document.getElementById('hint');
const overlayEl = document.getElementById('overlay');
const modalIconEl = document.getElementById('modalIcon');
const modalTitleEl = document.getElementById('modalTitle');
const modalTextEl = document.getElementById('modalText');
const modalBtnEl = document.getElementById('modalBtn');
const resetBtnEl = document.getElementById('resetBtn');
const pointsEl = document.getElementById('points');
const addChallengeBtn = document.getElementById('addChallengeBtn');

let cellEls = [];

function posToRow(pos) {
  return Math.floor(pos / COLS);
}

function posToCol(pos) {
  return pos % COLS;
}

function isSameRowOrCol(a, b) {
  return posToRow(a) === posToRow(b) || posToCol(a) === posToCol(b);
}

function isCleared(pos) {
  return state.board[pos] === pos;
}

function countCleared() {
  let count = 0;
  for (let i = 0; i < 12; i++) {
    if (isCleared(i)) count++;
  }
  return count;
}

function checkWin() {
  for (let i = 0; i < 12; i++) {
    if (state.board[i] !== i) return false;
  }
  return true;
}

function init() {
  state.board = [...INITIAL_BOARD];
  state.challenges = INITIAL_CHALLENGES;
  state.points = INITIAL_POINTS;
  state.selectedIndex = -1;
  state.gameOver = false;

  overlayEl.classList.remove('active');
  buildGrid();
  render();
}

function buildGrid() {
  gridEl.innerHTML = '';
  cellEls = [];

  for (let i = 0; i < 12; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = `
      <span class="badge">✅</span>
      <span class="symbol"></span>
      <span class="name"></span>
    `;
    cell.addEventListener('click', () => handleClick(i));
    gridEl.appendChild(cell);
    cellEls.push(cell);
  }
}

function render() {
  const cleared = countCleared();

  // 更新信息栏
  challengesEl.textContent = state.challenges;
  clearedEl.textContent = cleared;
  pointsEl.textContent = state.points;
  addChallengeBtn.disabled = state.points < ADD_CHALLENGE_COST || state.gameOver;

  for (let i = 0; i < 12; i++) {
    const cell = cellEls[i];
    const zodiac = ZODIACS[state.board[i]];

    cell.querySelector('.symbol').textContent = zodiac.symbol;
    cell.querySelector('.name').textContent = zodiac.name;

    // 清除所有状态 class
    cell.classList.remove('cleared', 'selected', 'swap-hint', 'disabled');

    // 已归位
    if (isCleared(i)) {
      cell.classList.add('cleared');
    }

    // 选中状态
    if (state.selectedIndex === i) {
      cell.classList.add('selected');
    }

    // 同行/同列提示
    if (state.selectedIndex >= 0 && state.selectedIndex !== i && isSameRowOrCol(state.selectedIndex, i)) {
      cell.classList.add('swap-hint');
    }

    // 游戏结束禁用
    if (state.gameOver) {
      cell.classList.add('disabled');
    }
  }

  // 更新提示文字
  if (state.gameOver) {
    hintEl.textContent = '';
  } else if (state.selectedIndex >= 0) {
    const selZodiac = ZODIACS[state.board[state.selectedIndex]];
    hintEl.textContent = `已选中 ${selZodiac.symbol} ${selZodiac.name}，点击同行或同列的格子进行交换`;
  } else {
    hintEl.textContent = '点击任意星座格子开始挑战';
  }
}

function handleClick(pos) {
  if (state.gameOver) return;
  if (state.challenges <= 0) return;

  // 消耗1次挑战次数
  state.challenges--;
  animateBump(challengesEl);

  if (state.selectedIndex < 0) {
    // 没有已选中的格子：选中当前格子
    state.selectedIndex = pos;
  } else if (state.selectedIndex === pos) {
    // 点击了同一个格子：取消选中
    state.selectedIndex = -1;
  } else {
    // 已有选中格子，判断是否同行/同列
    const prev = state.selectedIndex;
    if (isSameRowOrCol(prev, pos)) {
      // 交换
      swap(prev, pos);
      state.selectedIndex = -1;
    } else {
      // 不同行不同列，当前格子成为新的选中
      state.selectedIndex = pos;
    }
  }

  render();

  // 检查胜利
  if (checkWin()) {
    state.gameOver = true;
    showModal(true);
    return;
  }

  // 检查失败
  if (state.challenges <= 0 && !checkWin()) {
    state.gameOver = true;
    showModal(false);
  }
}

function swap(a, b) {
  const temp = state.board[a];
  state.board[a] = state.board[b];
  state.board[b] = temp;

  // 交换动画
  cellEls[a].classList.add('swapping');
  cellEls[b].classList.add('swapping');
  setTimeout(() => {
    cellEls[a].classList.remove('swapping');
    cellEls[b].classList.remove('swapping');
  }, 400);
}

function animateBump(el) {
  el.classList.remove('bump');
  // 触发 reflow 以重新播放动画
  void el.offsetWidth;
  el.classList.add('bump');
}

function showModal(won) {
  if (won) {
    modalIconEl.textContent = '🎉';
    modalTitleEl.textContent = '恭喜通关！';
    modalTextEl.textContent = '你成功将所有星座排列到了正确位置！';
  } else {
    modalIconEl.textContent = '😔';
    modalTitleEl.textContent = '挑战失败';
    modalTextEl.textContent = `挑战次数已用完，还有 ${12 - countCleared()} 个星座未归位。`;
  }
  // 延迟显示弹窗，让最后一次交换动画播放完
  setTimeout(() => {
    overlayEl.classList.add('active');
  }, 500);
}

function addChallenge() {
  if (state.gameOver) return;
  if (state.points < ADD_CHALLENGE_COST) return;

  state.points -= ADD_CHALLENGE_COST;
  state.challenges++;
  animateBump(challengesEl);
  animateBump(pointsEl);
  render();
}

// 事件绑定
resetBtnEl.addEventListener('click', init);
modalBtnEl.addEventListener('click', init);
addChallengeBtn.addEventListener('click', addChallenge);

// 启动游戏
init();
