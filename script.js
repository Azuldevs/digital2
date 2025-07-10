// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ ここに、ステップ2でコピーしたウェブアプリのURLを貼り付けてください ★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbx6BbHepIwv_JCCBQiD1-JQPE7rj7eLAJQ564JRoZZmLiHWbW1kQiZnlv8DG6wESLdRrA/exec";

// === DOM要素 ===
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
const subjectSelect = document.getElementById("subject-select");
const rankingListElem = document.getElementById("ranking-list");
const modalRankingListElem = document.getElementById("modal-ranking-list");
const finalScoreElem = document.getElementById("final-score");
const finalPercentElem = document.getElementById("final-percent");
const finalRankElem = document.getElementById("final-rank");
const resultModalEl = document.getElementById('resultModal');
const resultModal = new bootstrap.Modal(resultModalEl);

// === 状態変数 ===
let quizData = [];
let filteredQuiz = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let timerInterval = null;
const TIME_LIMIT = 30;
let answered = false;
let rankingData = [];

// === 定数 ===
const difficultyClasses = { "易しい": "bg-success", "普通": "bg-warning text-dark", "難しい": "bg-danger" };

// === 初期化処理 ===
document.addEventListener('DOMContentLoaded', async () => {
    startBtn.disabled = true;
    randomBtn.disabled = true;
    try {
        const response = await fetch(SPREADSHEET_URL);
        if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        quizData = data;
        populateSubjects();
        console.log("クイズデータをスプレッドシートから取得しました:", quizData);
    } catch (error) {
        console.error("スプレッドシートからのデータ取得に失敗しました:", error);
        alert("クイズデータの読み込みに失敗しました。URLやシート名が正しいか確認してください。");
    } finally {
        startBtn.disabled = false;
        randomBtn.disabled = false;
    }
    
    loadRanking();
    updateRankingList(rankingListElem);
    initializeEventListeners();
});

function initializeEventListeners() {
    startBtn.addEventListener("click", handleStart);
    randomBtn.addEventListener("click", handleRandomMode);
    nextBtn.addEventListener("click", handleNext);
    resultModalEl.addEventListener('hidden.bs.modal', () => {
        quizScreen.classList.add("d-none");
        homeScreen.classList.remove("d-none");
    });
}

// === データ処理・準備 ===
function populateSubjects() {
    const subjects = [...new Set(quizData.map(q => q.subject).filter(Boolean))];
    subjects.sort();
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

function getRankInfo(percentage) {
    if (percentage === 100) return { rank: "S", class: "bg-primary" };
    if (percentage >= 80) return { rank: "A", class: "bg-success" };
    if (percentage >= 60) return { rank: "B", class: "bg-info text-dark" };
    if (percentage >= 40) return { rank: "C", class: "bg-warning text-dark" };
    return { rank: "D", class: "bg-danger" };
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// === クイズ制御 ===
function handleStart() {
    // 1. 教科でフィルタリング
    const selectedSubject = subjectSelect.value;
    let tempQuiz = quizData;
    if (selectedSubject !== "all") {
        tempQuiz = quizData.filter(q => q.subject === selectedSubject);
    }

    // 2. 難易度でフィルタリング
    const selectedDifficulties = [...document.querySelectorAll("#home-screen input[type=checkbox]:checked")].map(c => c.value);
    if (selectedDifficulties.length === 0) {
        alert("難易度を少なくとも1つ選択してください。");
        return;
    }
    tempQuiz = tempQuiz.filter(q => selectedDifficulties.includes(q.difficulty));
    
    // 3. シャッフルして問題数を調整
    filteredQuiz = shuffleArray(tempQuiz);
    const count = document.getElementById("question-count").value;
    if (count !== "all") {
        filteredQuiz = filteredQuiz.slice(0, parseInt(count, 10));
    }
    
    startQuiz();
}

function handleRandomMode() {
    filteredQuiz = shuffleArray([...quizData]);
    startQuiz();
}

function startQuiz() {
    if (filteredQuiz.length === 0) {
        alert("出題できる問題がありません。条件を変更して再度お試しください。");
        return;
    }
    homeScreen.classList.add("d-none");
    quizScreen.classList.remove("d-none");
    currentQuestionIndex = 0;
    correctCount = 0;
    showQuestion();
}

function showQuestion() {
    if (timerInterval) clearInterval(timerInterval);
    answered = false;
    nextBtn.style.display = "none";
    resultElem.textContent = "";

    const currentQuestion = filteredQuiz[currentQuestionIndex];
    questionTextElem.textContent = `Q${currentQuestionIndex + 1}: ${currentQuestion.question}`;
    progressElem.textContent = `${currentQuestionIndex + 1} / ${filteredQuiz.length}`;
    difficultyElem.textContent = currentQuestion.difficulty;
    difficultyElem.className = `badge ${difficultyClasses[currentQuestion.difficulty] || "bg-secondary"}`;
    
    choicesElem.innerHTML = "";
    currentQuestion.choices.forEach((choice, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-outline-danger";
        btn.textContent = choice;
        btn.addEventListener("click", () => handleAnswer(idx, currentQuestion));
        choicesElem.appendChild(btn);
    });
    
    startTimer();
}

function handleAnswer(selectedIndex, question) {
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);

    const buttons = choicesElem.querySelectorAll("button");
    const correctIndex = question.answer;
    buttons.forEach(btn => btn.disabled = true);
    buttons[correctIndex].classList.replace("btn-outline-danger", "btn-success");

    if (selectedIndex === correctIndex) {
        correctCount++;
        resultElem.textContent = "正解！";
        resultElem.className = "text-center fs-5 fw-bold text-success";
    } else {
        buttons[selectedIndex]?.classList.replace("btn-outline-danger", "btn-danger");
        resultElem.textContent = `不正解… 正解は「${question.choices[correctIndex]}」`;
        resultElem.className = "text-center fs-5 fw-bold text-danger";
    }
    nextBtn.style.display = "block";
}

function handleNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < filteredQuiz.length) {
        showQuestion();
    } else {
        showFinalResult();
    }
}

function startTimer() {
    let currentTime = TIME_LIMIT;
    const updateDisplay = () => {
        const percentage = (currentTime / TIME_LIMIT) * 100;
        timerBarElem.style.width = `${percentage}%`;
        timerTextElem.textContent = currentTime;
        timerBarElem.classList.remove("bg-success", "bg-warning", "bg-danger");
        if (currentTime <= 5) timerBarElem.classList.add("bg-danger");
        else if (currentTime <= 10) timerBarElem.classList.add("bg-warning");
        else timerBarElem.classList.add("bg-success");
    };

    updateDisplay();
    timerInterval = setInterval(() => {
        currentTime--;
        updateDisplay();
        if (currentTime <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    if (answered) return;
    answered = true;
    const question = filteredQuiz[currentQuestionIndex];
    const correctIndex = question.answer;
    choicesElem.querySelectorAll("button").forEach(btn => btn.disabled = true);
    choicesElem.querySelectorAll("button")[correctIndex].classList.replace("btn-outline-danger", "btn-success");
    resultElem.textContent = `時間切れ！正解は「${question.choices[correctIndex]}」`;
    resultElem.className = "text-center fs-5 fw-bold text-danger";
    nextBtn.style.display = "block";
}

// === 結果・ランキング表示 ===
function showFinalResult() {
    const total = filteredQuiz.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const rankInfo = getRankInfo(percentage);

    finalScoreElem.textContent = `${correctCount} / ${total} 問正解`;
    finalPercentElem.textContent = percentage;
    finalRankElem.textContent = rankInfo.rank;
    finalRankElem.className = `badge ${rankInfo.class}`;
    
    saveResultToRanking(percentage);
    updateRankingList(modalRankingListElem);
    updateRankingList(rankingListElem);
    
    resultModal.show();
}

function saveResultToRanking(percentage) {
    const result = {
        score: `${correctCount}/${filteredQuiz.length}`,
        percentage: percentage,
        timestamp: new Date().toLocaleString('ja-JP')
    };
    rankingData.unshift(result);
    rankingData = rankingData.slice(0, 5); // 最新5件に絞る
    localStorage.setItem('quizRankingData', JSON.stringify(rankingData));
}

function loadRanking() {
    const savedData = localStorage.getItem('quizRankingData');
    if (savedData) {
        rankingData = JSON.parse(savedData);
    }
}

function updateRankingList(listElement) {
    listElement.innerHTML = "";
    if (rankingData.length === 0) {
        listElement.innerHTML = `<li class="list-group-item text-center text-muted">まだデータがありません</li>`;
        return;
    }
    rankingData.forEach(data => {
        const li = document.createElement("li");
        const rankInfo = getRankInfo(data.percentage);
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <div>
                <span>${data.score} (${data.percentage}%)</span>
                <small class="text-muted d-block">${data.timestamp}</small>
            </div>
            <span class="badge ${rankInfo.class}">${rankInfo.rank}</span>`;
        listElement.appendChild(li);
    });
}
