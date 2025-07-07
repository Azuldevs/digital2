const quizData = [
  {
    question: "Q1. デジタル変調方式で最も雑音に強いのは？",
    choices: ["ASK", "FSK", "PSK"],
    answer: 2
  },
  {
    question: "Q2. パリティビットの目的は？",
    choices: ["圧縮", "同期", "誤り検出"],
    answer: 2
  },
  {
    question: "Q3. 1バイトは何ビット？",
    choices: ["4ビット", "8ビット", "16ビット"],
    answer: 1
  },
  {
    question: "Q4. QAMとは何の略？",
    choices: ["Quadrature Amplitude Modulation", "Quick Access Mode", "Quantum Analog Method"],
    answer: 0
  }
];

let currentQuestion = null;
let answered = false;

function loadQuestion() {
  // 初期化
  document.getElementById("result").textContent = "";
  document.getElementById("next-button").style.display = "none";
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  // ランダムに1問選ぶ
  currentQuestion = quizData[Math.floor(Math.random() * quizData.length)];

  document.getElementById("question-text").textContent = currentQuestion.question;

  // 選択肢を表示
  currentQuestion.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
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

  document.getElementById("next-button").style.display = "inline-block";
}

window.onload = loadQuestion;
