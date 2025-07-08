// クイズアプリ JavaScript（バグ修正版）

// クイズデータ
const quizData = [
  {
    question: "日本の首都は？",
    choices: ["大阪", "京都", "東京", "名古屋"],
    answer: 2,
    difficulty: "易しい",
  },
  {
    question: "富士山の標高は？",
    choices: ["3776m", "3500m", "3000m", "4000m"],
    answer: 0,
    difficulty: "普通",
  },
  {
    question: "世界で一番大きい砂漠は？",
    choices: ["ゴビ砂漠", "サハラ砂漠", "アラビア砂漠", "カラハリ砂漠"],
    answer: 1,
    difficulty: "難しい",
  },
  {
    question: "日本で一番長い川は？",
    choices: ["信濃川", "利根川", "荒川", "淀川"],
    answer: 0,
    difficulty: "易しい",
  },
  {
    question: "金閣寺はどこにある？",
    choices: ["奈良", "京都", "大阪", "東京"],
    answer: 1,
    difficulty: "普通",
  },
  {
    question: "日本の最高峰は？",
    choices: ["富士山", "北岳", "間ノ岳", "奥穂高岳"],
    answer: 0,
    difficulty: "易しい",
  },
  {
    question: "日本で一番面積の大きい都道府県は？",
    choices: ["北海道", "岩手県", "福島県", "長野県"],
    answer: 0,
    difficulty: "普通",
  },
  {
    question: "源氏物語の作者は？",
    choices: ["紫式部", "清少納言", "和泉式部", "小野小町"],
    answer: 0,
    difficulty: "難しい",
  },
  {
    question: "日本の国鳥は？",
    choices: ["鶴", "雉", "鳩", "鷲"],
    answer: 1,
    difficulty: "普通",
  },
  {
    question: "徳川幕府の最後の将軍は？",
    choices: ["徳川家茂", "徳川慶喜", "徳川家定", "徳川家慶"],
    answer: 1,
    difficulty: "難しい",
  }
];

// DOM要素
const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const questionTextElem = document.getElementById("question-text");
const choicesElem = document.getElementById("choices");
const resultElem = document.getElementById("result");
const nextBtn = document.getElementById("next-button");
const progressElem = document.getElementById("progress");
const difficultyElem = document.getElementById("difficulty");
const timerBarElem = document.getElementById("timer-bar");
const timerTextElem = document.getElementById("timer-text");
const startBtn = document.getElementById("start-btn");
const randomBtn = document.getElementById("random-btn");
const rankingListElem = document.getElementById("ranking-list");
const modalRankingListElem = document.getElementById("modal-ranking-list");
const finalScoreElem = document.getElementById("final-score");
const finalPercentElem = document.getElementById("final-percent");
const finalRankElem = document.getElementById("final-rank");
const modalCloseBtn = document.getElementById("modal-close-btn");
const resultModalEl = document.getElementById('resultModal');
const resultModal = new bootstrap.Modal(resultModalEl);

// 状態変数
let filteredQuiz = [];
let currentQuestionIndex = 0;
let currentQuestion = null;
let correctCount = 0;
let timerInterval = null;
const timeLimit = 30;
let currentTime = timeLimit;
let answered = false;

// メモリ内ランキングデータ（localStorage代替）
let rankingData = [];

// 難易度の色付けマップ
const difficultyColors = {
  "易しい": "#27ae60",  // 緑
  "普通": "#f39c12",    // 黄
  "難しい": "#e74c3c",  // 赤
};

// 難易度のBootstrapクラスマップ
const difficultyClasses = {
  "易しい": "bg-success",
  "普通": "bg-warning",
  "難しい": "bg-danger"
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  updateRankingList();
  
  // イベントリスナーの設定
  startBtn.addEventListener("click", handleStart);
  randomBtn.addEventListener("click", handleRandomMode);
  nextBtn.addEventListener("click", handleNext);
  modalCloseBtn.addEventListener("click", handleModalClose);
});

// スタートボタン押下処理
function handleStart() {
  const selectedDifficulties = getSelectedDifficulties();
  if (selectedDifficulties.length === 0) {
    alert("難易度を少なくとも1つ選択してください。");
    return;
  }
  
  let count = document.getElementById("question-count").value;
  if (count !== "all") {
    count = parseInt(count, 10);
  }

  filteredQuiz = quizData.filter(q => selectedDifficulties.includes(q.difficulty));
  if (filteredQuiz.length === 0) {
    alert("選択した難易度の問題がありません。");
    return;
  }

  filteredQuiz = shuffleArray(filteredQuiz);

  if (count !== "all" && count < filteredQuiz.length) {
    filteredQuiz = filteredQuiz.slice(0, count);
  }

  startQuiz();
}

// お任せモード押下処理
function handleRandomMode() {
  filteredQuiz = shuffleArray(quizData);
  startQuiz();
}

// 次の問題ボタン処理
function handleNext() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= filteredQuiz.length) {
    showFinalResult();
  } else {
    showQuestion();
  }
}

// モーダル閉じる処理
function handleModalClose() {
  resultModal.hide();
  quizScreen.classList.add("d-none");
  homeScreen.classList.remove("d-none");
}

// 難易度チェックされたものを取得
function getSelectedDifficulties() {
  const checks = [...document.querySelectorAll("#home-screen input[type=checkbox]")];
  return checks.filter(c => c.checked).map(c => c.value);
}

// クイズ開始
function startQuiz() {
  homeScreen.classList.add("d-none");
  quizScreen.classList.remove("d-none");
  currentQuestionIndex = 0;
  correctCount = 0;
  showQuestion();
}

// UIリセット（バグ修正：不足していた関数を追加）
function resetQuizUI() {
  resultElem.textContent = "";
  resultElem.className = "text-center fs-5 fw-semibold";
  nextBtn.style.display = "none";
  
  // タイマーをクリア
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// 問題表示
function showQuestion() {
  resetQuizUI();

  currentQuestion = filteredQuiz[currentQuestionIndex];
  questionTextElem.textContent = `Q${currentQuestionIndex + 1}: ${currentQuestion.question}`;

  // 進捗表示
  progressElem.textContent = `${currentQuestionIndex + 1} / ${filteredQuiz.length}`;

  // 難易度表示と色付け
  difficultyElem.textContent = currentQuestion.difficulty;
  difficultyElem.className = `badge ${difficultyClasses[currentQuestion.difficulty] || "bg-secondary"}`;
  difficultyElem.style.backgroundColor = difficultyColors[currentQuestion.difficulty] || "#6c757d";

  // 選択肢表示
  choicesElem.innerHTML = "";
  currentQuestion.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-danger";
    btn.textContent = choice
