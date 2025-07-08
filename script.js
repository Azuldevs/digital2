const quizData = [
  {
    question: "Q1. デジタル変調方式で最も雑音に強いのは？",
    choices: ["ASK", "FSK", "PSK", "QAM"],
    answer: 2
  },
  {
    question: "Q2. パリティビットの目的は？",
    choices: ["圧縮", "同期", "誤り検出", "伝送速度向上"],
    answer: 2
  },
  {
    question: "Q3. 1バイトは何ビット？",
    choices: ["4ビット", "8ビット", "16ビット", "32ビット", "64ビット"],
    answer: 1
  },
  {
    question: "Q4. QAMとは何の略？",
    choices: [
      "Quadrature Amplitude Modulation",
      "Quick Access Mode",
      "Quantum Analog Method",
      "Quality Assurance Module"
    ],
    answer: 0
  }
];

let remainingQuestions = [...quizData];
let currentQuestion = null;
let correctCount = 0;
let totalCount = quizData.length;
let answered = false;

function loadQuestion() {
  document.getElementById("result").textContent = "";
  document.getElementById("next-button").style.display = "none";
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  if (remainingQuestions.length === 0) {
    showFinalResult();
    return;
  }

  const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
  currentQuestion = remainingQuestions.splice(randomIndex, 1)[0];
  document.getElementById("question-text").textContent = currentQuestion.question;

  currentQuestion.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary";
    btn.textContent = choice;
    btn.onclick = () => handleAnswer(index);
    choicesDiv.appendChild(btn);
  });

  answered = false;
}

function handleAnswer(selectedIndex) {
  if (answered) return;
  answered = true;

  const isCorrect = selectedIndex === currentQuestion.answer;
  document.getElementById("result").textContent = isCorrect ? "✅ 正解！" : "❌ 不正解";
  document.getElementById("result").className = `mt-3 fs-5 fw-bold text-${isCorrect ? "success" : "danger"}`;
  if (isCorrect) correctCount++;

  document.getElementById("next-button").style.display = "inline-block";
}

function showFinalResult() {
  const percent = Math.round((correctCount / totalCount) * 100);
  document.getElementById("quiz-box").innerHTML = `
    <h2 class="text-center">クイズ終了！</h2>
    <p class="fs-5 text-center">${totalCount}問中 ${correctCount}問正解でした。</p>
    <p class="fs-5 text-center">正答率：<strong>${percent}%</strong></p>
    <div class="text-center">
      <button class="btn btn-primary mt-3" onclick="restartQuiz()">もう一度挑戦する</button>
    </div>
  `;
}

function restartQuiz() {
  remainingQuestions = [...quizData];
  correctCount = 0;
  loadQuestion();
}

window.onload = loadQuestion;
