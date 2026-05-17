const RUN_TARGET = 10;
const STORAGE_KEY = 'hissanCollectorsDex';

const steps = ['ones', 'carry', 'tens', 'answer'];

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
  answerButton: document.querySelector('#answer-button'),
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
  stepOnes: document.querySelector('#step-ones'),
  stepCarry: document.querySelector('#step-carry'),
  stepTens: document.querySelector('#step-tens'),
  stepAnswer: document.querySelector('#step-answer'),
  onesExpression: document.querySelector('#ones-expression'),
  carryExpression: document.querySelector('#carry-expression'),
  tensExpression: document.querySelector('#tens-expression'),
  answerExpression: document.querySelector('#answer-expression'),
  previewHundreds: document.querySelector('#preview-hundreds'),
  previewTens: document.querySelector('#preview-tens'),
  previewOnes: document.querySelector('#preview-ones'),
  carryHundreds: document.querySelector('#carry-hundreds'),
  carryTens: document.querySelector('#carry-tens'),
  carryOnes: document.querySelector('#carry-ones'),
  addendATens: document.querySelector('#addend-a-tens'),
  addendAOnes: document.querySelector('#addend-a-ones'),
  addendBTens: document.querySelector('#addend-b-tens'),
  addendBOnes: document.querySelector('#addend-b-ones')
};

const stepEls = {
  ones: els.stepOnes,
  carry: els.stepCarry,
  tens: els.stepTens,
  answer: els.stepAnswer
};

const state = {
  currentProblem: null,
  currentStep: 'ones',
  streak: 0,
  ownedIds: loadDex(),
  lastRewardId: null,
  work: { onesDigit: null, carry: null, tensDigit: null }
};

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

  const answer = a + b;
  const onesSum = (a % 10) + (b % 10);
  const onesDigit = onesSum % 10;
  const carry = Math.floor(onesSum / 10);
  const tensSum = Math.floor(a / 10) + Math.floor(b / 10) + carry;
  const tensDigit = tensSum % 10;

  return { a, b, answer, onesSum, onesDigit, carry, tensSum, tensDigit };
}

function splitDigits(value) {
  return String(value).padStart(2, '0').split('');
}

function resetWork() {
  state.work = { onesDigit: null, carry: null, tensDigit: null };
}

function renderProblem() {
  const [aTens, aOnes] = splitDigits(state.currentProblem.a);
  const [bTens, bOnes] = splitDigits(state.currentProblem.b);

  els.addendATens.textContent = aTens;
  els.addendAOnes.textContent = aOnes;
  els.addendBTens.textContent = bTens;
  els.addendBOnes.textContent = bOnes;
  els.onesExpression.textContent = `${aOnes} + ${bOnes} = ?`;
  els.carryExpression.textContent = '10のまとまりは、十のくらいの上にかくよ。';
  els.tensExpression.textContent = `${aTens} + ${bTens} + メモ = ?`;
  els.answerExpression.textContent = '下にできたかずを、ぜんぶかこう。';
  renderStep();
}

function renderStep() {
  const currentIndex = steps.indexOf(state.currentStep);
  const answerDigits = String(state.currentProblem.answer).padStart(3, ' ');

  steps.forEach((step, index) => {
    stepEls[step].classList.toggle('active', step === state.currentStep);
    stepEls[step].classList.toggle('done', index < currentIndex);
  });

  els.carryHundreds.textContent = '\u00a0';
  els.carryTens.textContent = state.work.carry === null ? '\u00a0' : state.work.carry;
  els.carryOnes.textContent = '\u00a0';
  els.previewHundreds.textContent = currentIndex >= 2 && answerDigits[0] !== ' ' ? answerDigits[0] : '\u00a0';
  els.previewTens.textContent = state.work.tensDigit === null ? '\u00a0' : state.work.tensDigit;
  els.previewOnes.textContent = state.work.onesDigit === null ? '?' : state.work.onesDigit;

  const inputSettings = {
    ones: { min: 0, max: 9, button: '一のくらいをかく', label: '一のくらいにかくかず' },
    carry: { min: 0, max: 1, button: 'メモをかく', label: '十のくらいの上にかくかず' },
    tens: { min: 0, max: 9, button: '十のくらいをかく', label: '十のくらいにかくかず' },
    answer: { min: 0, max: 199, button: 'こたえをかく', label: 'さいごのこたえ' }
  }[state.currentStep];

  els.answerInput.min = String(inputSettings.min);
  els.answerInput.max = String(inputSettings.max);
  els.answerInput.value = '';
  els.answerButton.textContent = inputSettings.button;
  els.answerInput.setAttribute('aria-label', inputSettings.label);
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
  state.currentStep = 'ones';
  resetWork();
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

function moveToStep(step, message) {
  state.currentStep = step;
  renderStep();
  setFeedback(message, 'success');
  els.answerInput.focus();
}

function handleAnswer(event) {
  event.preventDefault();
  const userAnswer = Number(els.answerInput.value);

  if (state.currentStep === 'ones') {
    if (userAnswer === state.currentProblem.onesDigit) {
      state.work.onesDigit = userAnswer;
      moveToStep('carry', '一のくらい、できたね。つぎはくり上がりメモをかこう。');
      return;
    }

    setFeedback(`${state.currentProblem.onesSum}の一のくらいにかくかずを入れてね。`, 'error');
    els.answerInput.select();
    return;
  }

  if (state.currentStep === 'carry') {
    if (userAnswer === state.currentProblem.carry) {
      state.work.carry = userAnswer;
      moveToStep('tens', 'メモできたね。つぎは十のくらいをたそう。');
      return;
    }

    setFeedback('くり上がりメモは、10のまとまりのかずだよ。', 'error');
    els.answerInput.select();
    return;
  }

  if (state.currentStep === 'tens') {
    if (userAnswer === state.currentProblem.tensDigit) {
      state.work.tensDigit = userAnswer;
      moveToStep('answer', '十のくらい、できたね。さいごにこたえをぜんぶかこう。');
      return;
    }

    setFeedback('十のくらいどうしと、メモの1をたしてみよう。', 'error');
    els.answerInput.select();
    return;
  }

  if (userAnswer === state.currentProblem.answer) {
    completeProblem();
    return;
  }

  setFeedback('下にできたかずを、左からじゅんにぜんぶかこう。', 'error');
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
  setFeedback('もんだいをかえたよ。まずは一のくらいからやろう。');
  nextProblem();
});
els.resetRunButton.addEventListener('click', resetRun);
els.resetDexButton.addEventListener('click', resetDex);
els.closeModalButton.addEventListener('click', closeModal);
els.rewardModal.addEventListener('click', (event) => {
  if (event.target === els.rewardModal) closeModal();
});

renderProgress();
renderDex();
renderLastReward();
nextProblem();
