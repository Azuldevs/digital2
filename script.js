const quizData = [
  {
    question: "Q1. デジタル変調方式で最も雑音に強いのは？",
    choices: ["ASK", "FSK", "PSK", "QAM"],
    answer: 2,
    difficulty: "普通"
  },
  {
    question: "Q2. パリティビットの目的は？",
    choices: ["圧縮", "同期", "誤り検出", "伝送速度向上"],
    answer: 2,
    difficulty: "易しい"
  },
  {
    question: "Q3. 1バイトは何ビット？",
    choices: ["4ビット", "8ビット", "16ビット", "32ビット", "64ビット"],
    answer: 1,
    difficulty: "易しい"
  },
  {
    question: "Q4. QAMとは何の略？",
    choices: [
      "Quadrature Amplitude Modulation",
      "Quick Access Mode",
      "Quantum Analog Method",
      "Quality Assurance Module"
    ],
    answer: 0,
    difficulty: "難しい"
  }
];

let remainingQuestions = [];
let currentQuestion = null;
let correctCount = 0;
let questionIndex = 0;
const totalCount = quizData.length;
let answered = false;
let timerInterval = null;
const timeLimit = 30;
let currentTime = timeLimit;

const modal = new bootstrap.Modal(document.getElementById('resultModal'));

function loadQuestion() {
  clearInterval(timerInterval);
  document.getElementById("result").textContent = "";
  document.getElementById("result").className = "";
  document.getElementById("next-button").style.display = "none";
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  if (remainingQuestions.length === 0) {
    showFinalResult();
    return;
  }

  currentQuestion = remainingQuestions.shift();
  questionIndex++;
  answered = false;
  currentTime = timeLimit;

  document.getElementById("question-text").textContent = currentQuestion.question;
  document.getElementById("progress").textContent = `問題 ${questionIndex} / ${totalCount}`;

  const diff = document.getElementById("difficulty");
  diff.textContent = currentQuestion.difficulty;
  diff.className = "badge " + getDifficultyBadge(currentQuestion.difficulty);

  currentQuestion.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary";
    btn.textContent = choice;
    btn.onclick = () => handleAnswer(index);
    choicesDiv.appendChild(btn);
  });

  updateTimerDisplay();
  startTimer();
}

function getDifficultyBadge(difficulty) {
  switch(difficulty) {
    case "易しい": return "bg-success";
    case "普通": return "bg-warning text-dark";
    case "難しい": return "bg-danger";
    default: return "bg-secondary";
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    currentTime--;
    updateTimerDisplay();

    if (currentTime <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const percent = (currentTime / timeLimit) * 100;
  const bar = document.getElementById("timer-bar");
  bar.style.width = `${percent}%`;
  document.getElementById("timer-text").textContent = currentTime;

  bar.classList.remove("bg-success", "bg-warning", "bg-danger");
  if (currentTime > 20) {
    bar.classList.add("bg-success");
  } else if (currentTime > 10) {
    bar.classList.add("bg-warning");
  } else {
    bar.classList.add("bg-danger");
  }
}

function handleTimeout() {
  if (answered) return;
  answered = true;

  showResult(false, "⌛ 時間切れ！不正解です。");
}

function handleAnswer(selectedIndex) {
  if (answered) return;
  answered = true;

  clearInterval(timerInterval);

  const isCorrect = selectedIndex === currentQuestion.answer;
  showResult(isCorrect, isCorrect ? "✅ 正解！" : "❌ 不正解");
}

function showResult(isCorrect, message) {
  const resultElem = document.getElementById("result");
  resultElem.textContent = message;
  resultElem.className = `text-center fs-5 fw-semibold ${isCorrect ? "text-success" : "text-danger"}`;

  if (isCorrect) correctCount++;

  document.getElementById("next-button").style.display = "block";
}

function showFinalResult() {
  const percent = Math.round((correctCount / totalCount) * 100);
  const rank = getRank(percent);
  saveToRanking(correctCount, percent, rank);

  // モーダルに結果をセット
  document.getElementById("final-score").textContent = `${totalCount}問中 ${correctCount}問正解でした。`;
  document.getElementById("final-percent").textContent = percent;
  const rankBadge = document.getElementById("final-rank");
  rankBadge.textContent = rank;
  rankBadge.className = "badge fs-5 " + getRankBadgeClass(rank);

  renderRanking();

  modal.show();
  resetQuizUI();
}

function resetQuizUI() {
  // クイズ画面をリセット（質問エリアなど）
  document.getElementById("progress").textContent = "";
  document.getElementById("difficulty").textContent = "";
  document.getElementById("question-text").textContent = "";
  document.getElementById("choices").innerHTML = "";
  document.getElementById("result").textContent = "";
  document.getElementById("next-button").style.display = "none";

  // タイマーバーリセット
  const bar = document.getElementById("timer-bar");
  bar.style.width = "0%";
  bar.className = "progress-bar bg-success";
  document.getElementById("timer-text").textContent = "";
}

function getRank(percent) {
  if (percent === 100) return "S";
  if (percent >= 80) return "A";
  if (percent >= 60) return "B

