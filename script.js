// クイズアプリ JavaScript（完全版）

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
  },
  {
    question: "日本の三大夜景都市は？",
    choices: ["函館・横浜・神戸", "札幌・東京・大阪", "函館・神戸・長崎", "東京・横浜・神戸"],
    answer: 2,
    difficulty: "難しい",
  },
  {
    question: "日本で最も深い湖は？",
    choices: ["琵琶湖", "田沢湖", "十和田湖", "中禅寺湖", "洞爺湖"],
    answer: 1,
    difficulty: "普通",
  },
  {
    question: "四国の県はいくつある？",
    choices: ["3つ", "4つ", "5つ", "6つ"],
    answer: 1,
    difficulty: "易しい",
  },
  {
    question: "日本の伝統的な数の数え方で「ひとつ、ふたつ、みっつ」の次は？",
    choices: ["よっつ", "よんつ", "しっつ", "よつ"],
    answer: 0,
    difficulty: "普通",
  },
  {
    question: "日本で最も古い現存する木造建築は？",
    choices: ["法隆寺", "東大寺", "清水寺", "金閣寺", "銀閣寺", "平等院"],
    answer: 0,
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

// ランクの判定と色付け
function getRankInfo(percentage) {
  if (percentage >= 90) return { rank: "S", class: "bg-primary" };
  if (percentage >= 80) return { rank: "A", class: "bg-success" };
  if (percentage >= 70) return { rank: "B", class: "bg-info" };
  if (percentage >= 60) return { rank: "C", class: "bg-warning" };
  return { rank: "D", class: "bg-danger" };
}

// 配列シャッフル関数
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
  filteredQuiz = shuffleArray([...quizData]);
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

// UIリセット
function resetQuizUI() {
  resultElem.textContent = "";
  resultElem.className = "text-center fs-5 fw-semibold";
  nextBtn.style.display = "none";
  answered = false;
  
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

  // 選択肢表示（任意の数の選択肢に対応）
  choicesElem.innerHTML = "";
  currentQuestion.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-danger";
    btn.textContent = choice;
    btn.setAttribute("data-index", idx);
    btn.addEventListener("click", () => handleAnswer(idx));
    choicesElem.appendChild(btn);
  });

  // タイマー開始
  startTimer();
}

// 回答処理
function handleAnswer(selectedIndex) {
  if (answered) return;

  answered = true;
  clearInterval(timerInterval);

  const buttons = choicesElem.querySelectorAll("button");
  const correctIndex = currentQuestion.answer;

  // 全ボタンを無効化
  buttons.forEach(btn => {
    btn.disabled = true;
  });

  // 正解ボタンを緑に
  buttons[correctIndex].classList.remove("btn-outline-danger");
  buttons[correctIndex].classList.add("btn-success");

  // 選択したボタンの処理
  if (selectedIndex === correctIndex) {
    // 正解
    correctCount++;
    resultElem.textContent = "正解！";
    resultElem.classList.add("text-success");
  } else {
    // 不正解
    buttons[selectedIndex].classList.remove("btn-outline-danger");
    buttons[selectedIndex].classList.add("btn-danger");
    resultElem.textContent = `不正解。正解は「${currentQuestion.choices[correctIndex]}」でした。`;
    resultElem.classList.add("text-danger");
  }

  // 次へボタンを表示
  nextBtn.style.display = "block";
}

// タイマー開始
function startTimer() {
  currentTime = timeLimit;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    currentTime--;
    updateTimerDisplay();

    if (currentTime <= 0) {
      clearInterval(timerInterval);
      handleTimeUp();
    }
  }, 1000);
}

// タイマー表示更新
function updateTimerDisplay() {
  const percentage = (currentTime / timeLimit) * 100;
  timerBarElem.style.width = `${percentage}%`;
  timerTextElem.textContent = currentTime;
  
  // 残り時間に応じて色を変更
  if (currentTime <= 5) {
    timerBarElem.classList.remove("bg-success", "bg-warning");
    timerBarElem.classList.add("bg-danger");
  } else if (currentTime <= 10) {
    timerBarElem.classList.remove("bg-success", "bg-danger");
    timerBarElem.classList.add("bg-warning");
  } else {
    timerBarElem.classList.remove("bg-warning", "bg-danger");
    timerBarElem.classList.add("bg-success");
  }
}

// 時間切れ処理
function handleTimeUp() {
  if (answered) return;

  answered = true;
  const buttons = choicesElem.querySelectorAll("button");
  const correctIndex = currentQuestion.answer;

  // 全ボタンを無効化
  buttons.forEach(btn => {
    btn.disabled = true;
  });

  // 正解ボタンを緑に
  buttons[correctIndex].classList.remove("btn-outline-danger");
  buttons[correctIndex].classList.add("btn-success");

  resultElem.textContent = `時間切れ！正解は「${currentQuestion.choices[correctIndex]}」でした。`;
  resultElem.classList.add("text-danger");

  // 次へボタンを表示
  nextBtn.style.display = "block";
}

// 最終結果表示
function showFinalResult() {
  const percentage = Math.round((correctCount / filteredQuiz.length) * 100);
  const rankInfo = getRankInfo(percentage);

  // 結果をランキングに追加
  const result = {
    score: `${correctCount}/${filteredQuiz.length}`,
    percentage: percentage,
    rank: rankInfo.rank,
    timestamp: new Date().toLocaleString('ja-JP')
  };

  rankingData.unshift(result);
  if (rankingData.length > 5) {
    rankingData = rankingData.slice(0, 5);
  }

  // モーダルに結果を表示
  finalScoreElem.textContent = `${correctCount}/${filteredQuiz.length}問正解`;
  finalPercentElem.textContent = percentage;
  finalRankElem.textContent = rankInfo.rank;
  finalRankElem.className = `badge ${rankInfo.class}`;

  // ランキングリストを更新
  updateRankingList();
  updateModalRankingList();

  // モーダルを表示
  resultModal.show();
}

// ランキングリスト更新
function updateRankingList() {
  rankingListElem.innerHTML = "";
  
  if (rankingData.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center";
    li.textContent = "まだデータがありません";
    rankingListElem.appendChild(li);
    return;
  }

  rankingData.forEach((data, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    
    const rankInfo = getRankInfo(data.percentage);
    li.innerHTML = `
      <span>${index + 1}位: ${data.score} (${data.percentage}%)</span>
      <span class="badge ${rankInfo.class}">${data.rank}</span>
    `;
    
    rankingListElem.appendChild(li);
  });
}

// モーダル内ランキングリスト更新
function updateModalRankingList() {
  modalRankingListElem.innerHTML = "";
  
  if (rankingData.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center";
    li.textContent = "まだデータがありません";
    modalRankingListElem.appendChild(li);
    return;
  }

  rankingData.forEach((data, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    
    const rankInfo = getRankInfo(data.percentage);
    li.innerHTML = `
      <span>${index + 1}位: ${data.score} (${data.percentage}%)</span>
      <span class="badge ${rankInfo.class}">${data.rank}</span>
    `;
    
    modalRankingListElem.appendChild(li);
  });
}
