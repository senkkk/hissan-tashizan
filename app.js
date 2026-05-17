const RUN_TARGET = 10;
const STORAGE_KEY = 'hissanCollectorsDex';

const monsters = [
  { id: 'carrycub', name: 'くりあがリス', emoji: '🐿️', description: '1をとなりの位へ運ぶのが得意な、しっかり者の森モンスター。' },
  { id: 'tenpuff', name: 'テンテンワタ', emoji: '☁️', description: '10のまとまりをふわふわ集めて、空に答えを描く。' },
  { id: 'sumander', name: 'タスノコ', emoji: '🦎', description: '足し算が成功するとしっぽの炎が明るくなる。' },
  { id: 'digitfin', name: 'ケタイルカ', emoji: '🐬', description: '一の位と十の位の波を読んで、すいすい計算する。' },
  { id: 'plusbun', name: 'プラスピョン', emoji: '🐰', description: '正解の音を聞くと高くジャンプする元気な相棒。' },
  { id: 'abacusowl', name: 'そろばんフクロウ', emoji: '🦉', description: '夜でも位取りを見失わない、図鑑の知恵袋。' },
  { id: 'numberdragon', name: 'ナンバードラゴン', emoji: '🐉', description: '大きな答えほど翼がきらきら輝くレアモンスター。' },
  { id: 'pencilion', name: 'エンピツライオン', emoji: '🦁', description: '筆算の線をまっすぐ引く、勇敢なリーダー。' },
  { id: 'eraserpanda', name: 'ケシゴムパンダ', emoji: '🐼', description: '間違えてもやり直せるよう、やさしく見守る。' },
  { id: 'starcarry', name: 'スターキャリー', emoji: '⭐', description: '10問連続の努力から生まれる、きらめく達成のしるし。' },
  { id: 'calcrab', name: 'カゾエガニ', emoji: '🦀', description: 'はさみで数字をつまんで、10のまとまりを作る。' },
  { id: 'rainbowmole', name: 'ニジモグラ', emoji: '🌈', description: '地面の下から答えへの近道を掘り当てる。' }
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
  onesExpression: document.querySelector('#ones-expression'),
  carryExplanation: document.querySelector('#carry-explanation'),
  tensExpression: document.querySelector('#tens-expression'),
  previewHundreds: document.querySelector('#preview-hundreds'),
  previewTens: document.querySelector('#preview-tens'),
  previewOnes: document.querySelector('#preview-ones'),
  addendATens: document.querySelector('#addend-a-tens'),
  addendAOnes: document.querySelector('#addend-a-ones'),
  addendBTens: document.querySelector('#addend-b-tens'),
  addendBOnes: document.querySelector('#addend-b-ones')
};

const state = {
  currentProblem: null,
  currentStep: 'ones',
  streak: 0,
  ownedIds: loadDex(),
  lastRewardId: null
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
  const upperDigits = Math.floor(answer / 10);

  return { a, b, answer, onesSum, onesDigit, carry, upperDigits };
}

function splitDigits(value) {
  return String(value).padStart(2, '0').split('');
}

function renderProblem() {
  const [aTens, aOnes] = splitDigits(state.currentProblem.a);
  const [bTens, bOnes] = splitDigits(state.currentProblem.b);

  els.addendATens.textContent = aTens;
  els.addendAOnes.textContent = aOnes;
  els.addendBTens.textContent = bTens;
  els.addendBOnes.textContent = bOnes;
  els.onesExpression.textContent = `${aOnes} + ${bOnes} = ?`;
  els.carryExplanation.textContent = `${aOnes} + ${bOnes} = ${state.currentProblem.onesSum}。一の位には${state.currentProblem.onesDigit}を書いて、十の位へ${state.currentProblem.carry}をくり上げます。`;
  els.tensExpression.textContent = `${aTens} + ${bTens} + ${state.currentProblem.carry} = ?`;
  renderStep();
}

function renderStep() {
  const isOnesStep = state.currentStep === 'ones';
  const answerDigits = String(state.currentProblem.answer).padStart(3, ' ');

  els.stepOnes.classList.toggle('active', isOnesStep);
  els.stepOnes.classList.toggle('done', !isOnesStep);
  els.stepCarry.classList.toggle('active', !isOnesStep);
  els.stepCarry.classList.toggle('done', !isOnesStep);
  els.stepTens.classList.toggle('active', !isOnesStep);

  els.previewHundreds.textContent = isOnesStep ? '\u00a0' : answerDigits[0].replace(' ', '\u00a0');
  els.previewTens.textContent = isOnesStep ? '\u00a0' : answerDigits[1];
  els.previewOnes.textContent = isOnesStep ? '?' : state.currentProblem.onesDigit;
  els.answerInput.min = isOnesStep ? '0' : '1';
  els.answerInput.max = isOnesStep ? '9' : '19';
  els.answerInput.value = '';
  els.answerButton.textContent = isOnesStep ? '一の位をこたえる' : '十の位をこたえる';
  els.answerInput.setAttribute('aria-label', isOnesStep ? '一の位に書く数字' : '十の位以上に書く数字');
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
        <p>${isOwned ? monster.description : '10問クリアして出会ってみよう。'}</p>
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
      <p>まだキャラクターはいません。10問クリアして仲間を見つけよう！</p>
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
    setFeedback('10問クリア！新しい仲間がやってきたよ。', 'success');
    awardMonster();
  } else {
    setFeedback(`正解！答えは${state.currentProblem.answer}。${RUN_TARGET}問まであと${RUN_TARGET - state.streak}問。`, 'success');
  }

  nextProblem();
}

function handleAnswer(event) {
  event.preventDefault();
  const userAnswer = Number(els.answerInput.value);

  if (state.currentStep === 'ones') {
    if (userAnswer === state.currentProblem.onesDigit) {
      state.currentStep = 'tens';
      renderStep();
      setFeedback(`一の位は正解！${state.currentProblem.onesSum}だから、${state.currentProblem.carry}を十の位へくり上げよう。`, 'success');
      els.answerInput.focus();
      return;
    }

    setFeedback(`${state.currentProblem.onesSum}の一の位に書く数字を考えてみよう。10のまとまりは十の位へくり上げるよ。`, 'error');
    els.answerInput.select();
    return;
  }

  if (userAnswer === state.currentProblem.upperDigits) {
    completeProblem();
    return;
  }

  setFeedback('惜しい！十の位どうしを足して、くり上がりの1も足してみよう。', 'error');
  els.answerInput.select();
}

function resetRun() {
  state.streak = 0;
  renderProgress();
  setFeedback('今回の挑戦をリセットしたよ。新しい問題から始めよう。');
  nextProblem();
}

function resetDex() {
  const ok = window.confirm('図鑑データをすべて消します。よろしいですか？');
  if (!ok) return;

  state.ownedIds.clear();
  state.lastRewardId = null;
  saveDex();
  renderDex();
  renderLastReward();
  setFeedback('図鑑データをリセットしました。');
}

function closeModal() {
  els.rewardModal.hidden = true;
  setFeedback('図鑑に登録完了！次の10問にも挑戦しよう。', 'success');
  els.answerInput.focus();
}

els.answerForm.addEventListener('submit', handleAnswer);
els.newProblemButton.addEventListener('click', () => {
  setFeedback('問題を変更しました。まずは一の位から計算しよう。');
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
