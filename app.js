const RUN_TARGET = 10;
const STORAGE_KEY = 'hissanCollectorsDex';

const monsters = [
  { id: 'carrycub', name: 'くりあがリス', emoji: '🐿️', description: '1をとなりへはこぶのがとくいな、森のモンスター。' },
  { id: 'tenpuff', name: 'テンテンワタ', emoji: '☁️', description: '10のまとまりをふわふわあつめて、空にこたえをかくよ。' },
  { id: 'sumander', name: 'タスノコ', emoji: '🦎', description: '足しざんができると、しっぽの火があかるくなるよ。' },
  { id: 'digitfin', name: 'ケタイルカ', emoji: '🐬', description: '一のくらいと十のくらいのなみをよんで、すいすいすすむよ。' },
  { id: 'plusbun', name: 'プラスピョン', emoji: '🐰', description: '正かいの音をきくと、たかくジャンプするげんきななかま。' },
  { id: 'abacusowl', name: 'そろばんフクロウ', emoji: '🦉', description: 'よるでもくらいを見うしなわない、かしこいフクロウ。' },
  { id: 'numberdragon', name: 'ナンバードラゴン', emoji: '🐉', description: '大きなこたえほど、つばさがきらきらひかるよ。' },
  { id: 'pencilion', name: 'エンピツライオン', emoji: '🦁', description: 'ヒッサンのせんをまっすぐひく、ゆうかんなリーダー。' },
  { id: 'eraserpanda', name: 'ケシゴムパンダ', emoji: '🐼', description: 'まちがえてもだいじょうぶ。やさしく見まもるよ。' },
  { id: 'starcarry', name: 'スターキャリー', emoji: '⭐', description: '10もんがんばるとあらわれる、きらきらのしるし。' },
  { id: 'calcrab', name: 'カゾエガニ', emoji: '🦀', description: 'はさみですうじをつまんで、10のまとまりをつくるよ。' },
  { id: 'rainbowmole', name: 'ニジモグラ', emoji: '🌈', description: '土の下から、こたえへのみちをほりあてるよ。' }
];

const els = {
  streakCount: document.querySelector('#streak-count'),
  remainingCount: document.querySelector('#remaining-count'),
  progressBar: document.querySelector('#progress-bar'),
  answerForm: document.querySelector('#answer-form'),
  answerInput: document.querySelector('#answer-input'),
  feedback: document.querySelector('#feedback'),
  newProblemButton: document.querySelector('#new-problem-button'),
  resetRunButton: document.querySelector('#reset-run-button'),
  resetDexButton: document.querySelector('#reset-dex-button'),
  ownedCount: document.querySelector('#owned-count'),
  totalCount: document.querySelector('#total-count'),
  dexGrid: document.querySelector('#dex-grid'),
  lastReward: document.querySelector('#last-reward'),
  rewardModal: document.querySelector('#reward-modal'),
  modalEmoji: document.querySelector('#modal-emoji'),
  modalTitle: document.querySelector('#modal-title'),
  modalDescription: document.querySelector('#modal-description'),
  closeModalButton: document.querySelector('#close-modal-button'),
  clearWritingButton: document.querySelector('#clear-writing-button'),
  writingPad: document.querySelector('#writing-pad'),
  addendATens: document.querySelector('#addend-a-tens'),
  addendAOnes: document.querySelector('#addend-a-ones'),
  addendBTens: document.querySelector('#addend-b-tens'),
  addendBOnes: document.querySelector('#addend-b-ones')
};

const state = {
  currentProblem: null,
  streak: 0,
  ownedIds: loadDex(),
  lastRewardId: null,
  isDrawing: false
};

const drawingContext = els.writingPad.getContext('2d');

function loadDex() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveDex() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.ownedIds]));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createCarryProblem() {
  let a = 0;
  let b = 0;

  do {
    a = randomInt(10, 99);
    b = randomInt(10, 99);
  } while ((a % 10) + (b % 10) < 10);

  return { a, b, answer: a + b };
}

function splitDigits(value) {
  return String(value).padStart(2, '0').split('');
}

function getCanvasPoint(event) {
  const rect = els.writingPad.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * els.writingPad.width,
    y: ((event.clientY - rect.top) / rect.height) * els.writingPad.height
  };
}

function drawGuideLines() {
  drawingContext.save();
  drawingContext.clearRect(0, 0, els.writingPad.width, els.writingPad.height);
  drawingContext.strokeStyle = 'rgba(91, 124, 250, 0.16)';
  drawingContext.lineWidth = 2;
  drawingContext.setLineDash([10, 12]);

  [0.33, 0.66].forEach((ratio) => {
    const x = els.writingPad.width * ratio;
    drawingContext.beginPath();
    drawingContext.moveTo(x, 18);
    drawingContext.lineTo(x, els.writingPad.height - 18);
    drawingContext.stroke();
  });

  drawingContext.strokeStyle = 'rgba(21, 28, 48, 0.12)';
  [0.5, 0.78].forEach((ratio) => {
    const y = els.writingPad.height * ratio;
    drawingContext.beginPath();
    drawingContext.moveTo(18, y);
    drawingContext.lineTo(els.writingPad.width - 18, y);
    drawingContext.stroke();
  });

  drawingContext.restore();
}

function startDrawing(event) {
  event.preventDefault();
  state.isDrawing = true;
  const point = getCanvasPoint(event);
  drawingContext.beginPath();
  drawingContext.moveTo(point.x, point.y);
}

function draw(event) {
  if (!state.isDrawing) return;
  event.preventDefault();
  const point = getCanvasPoint(event);
  drawingContext.lineTo(point.x, point.y);
  drawingContext.stroke();
}

function stopDrawing() {
  if (!state.isDrawing) return;
  state.isDrawing = false;
  drawingContext.closePath();
}

function setupWritingPad() {
  drawingContext.lineWidth = 10;
  drawingContext.lineCap = 'round';
  drawingContext.lineJoin = 'round';
  drawingContext.strokeStyle = '#151c30';
  drawGuideLines();
}

function renderProblem() {
  const [aTens, aOnes] = splitDigits(state.currentProblem.a);
  const [bTens, bOnes] = splitDigits(state.currentProblem.b);

  els.addendATens.textContent = aTens;
  els.addendAOnes.textContent = aOnes;
  els.addendBTens.textContent = bTens;
  els.addendBOnes.textContent = bOnes;
  els.answerInput.value = '';
  drawGuideLines();
}

function renderProgress() {
  els.streakCount.textContent = state.streak;
  els.remainingCount.textContent = Math.max(RUN_TARGET - state.streak, 0);
  els.progressBar.style.width = `${(state.streak / RUN_TARGET) * 100}%`;
}

function renderDex() {
  els.totalCount.textContent = monsters.length;
  els.ownedCount.textContent = state.ownedIds.size;
  els.dexGrid.innerHTML = monsters.map((monster, index) => {
    const isOwned = state.ownedIds.has(monster.id);
    return `
      <article class="dex-card ${isOwned ? '' : 'locked'}">
        <div class="monster-emoji" aria-hidden="true">${isOwned ? monster.emoji : '?'}</div>
        <h3>No.${String(index + 1).padStart(2, '0')} ${isOwned ? monster.name : '????'}</h3>
        <p>${isOwned ? monster.description : '10もんクリアして、あいにいこう。'}</p>
      </article>
    `;
  }).join('');
}

function renderLastReward() {
  const monster = monsters.find((candidate) => candidate.id === state.lastRewardId);

  if (!monster) {
    els.lastReward.className = 'last-reward empty';
    els.lastReward.innerHTML = `
      <div class="monster-emoji" aria-hidden="true">?</div>
      <p>まだモンスターはいません。10もんクリアして、なかまを見つけよう！</p>
    `;
    return;
  }

  els.lastReward.className = 'last-reward';
  els.lastReward.innerHTML = `
    <div class="monster-emoji" aria-hidden="true">${monster.emoji}</div>
    <div>
      <h3>${monster.name}</h3>
      <p>${monster.description}</p>
    </div>
  `;
}

function setFeedback(message, type = '') {
  els.feedback.textContent = message;
  els.feedback.className = `feedback ${type}`.trim();
}

function nextProblem() {
  state.currentProblem = createCarryProblem();
  renderProblem();
  if (!els.rewardModal.hidden) return;
  els.answerInput.focus();
}

function chooseReward() {
  const unowned = monsters.filter((monster) => !state.ownedIds.has(monster.id));
  const pool = unowned.length > 0 ? unowned : monsters;
  return pool[randomInt(0, pool.length - 1)];
}

function awardMonster() {
  const monster = chooseReward();
  state.ownedIds.add(monster.id);
  state.lastRewardId = monster.id;
  state.streak = 0;
  saveDex();

  els.modalEmoji.textContent = monster.emoji;
  els.modalTitle.textContent = `${monster.name}をゲット！`;
  els.modalDescription.textContent = monster.description;
  els.rewardModal.hidden = false;

  renderProgress();
  renderDex();
  renderLastReward();
}

function completeProblem() {
  state.streak += 1;
  renderProgress();

  if (state.streak >= RUN_TARGET) {
    setFeedback('10もんクリア！あたらしいなかまがきたよ。', 'success');
    awardMonster();
  } else {
    setFeedback(`正かい！こたえは${state.currentProblem.answer}。あと${RUN_TARGET - state.streak}もん。`, 'success');
  }

  nextProblem();
}

function handleAnswer(event) {
  event.preventDefault();
  const userAnswer = Number(els.answerInput.value);

  if (userAnswer === state.currentProblem.answer) {
    completeProblem();
    return;
  }

  setFeedback('もういちど、ひっさんメモを見ながらこたえを入れてね。', 'error');
  els.answerInput.select();
}

function resetRun() {
  state.streak = 0;
  renderProgress();
  setFeedback('いまのチャレンジをリセットしたよ。あたらしいもんだいからはじめよう。');
  nextProblem();
}

function resetDex() {
  const ok = window.confirm('ずかんをぜんぶけします。いいですか？');
  if (!ok) return;

  state.ownedIds.clear();
  state.lastRewardId = null;
  saveDex();
  renderDex();
  renderLastReward();
  setFeedback('ずかんをリセットしたよ。');
}

function closeModal() {
  els.rewardModal.hidden = true;
  setFeedback('ずかんにのったよ！つぎの10もんにもチャレンジしよう。', 'success');
  els.answerInput.focus();
}

els.answerForm.addEventListener('submit', handleAnswer);
els.newProblemButton.addEventListener('click', () => {
  setFeedback('もんだいをかえたよ。ひっさんメモに書いてから、こたえを入れよう。');
  nextProblem();
});
els.resetRunButton.addEventListener('click', resetRun);
els.resetDexButton.addEventListener('click', resetDex);
els.closeModalButton.addEventListener('click', closeModal);
els.clearWritingButton.addEventListener('click', drawGuideLines);
els.writingPad.addEventListener('pointerdown', startDrawing);
els.writingPad.addEventListener('pointermove', draw);
els.writingPad.addEventListener('pointerup', stopDrawing);
els.writingPad.addEventListener('pointercancel', stopDrawing);
els.writingPad.addEventListener('pointerleave', stopDrawing);
els.rewardModal.addEventListener('click', (event) => {
  if (event.target === els.rewardModal) closeModal();
});

setupWritingPad();
renderProgress();
renderDex();
renderLastReward();
nextProblem();
