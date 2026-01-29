const quizData = [
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tool ML", "None"], correct: 0 },
    { question: "Which language styles web pages?", options: ["HTML", "CSS", "JavaScript", "Python"], correct: 1 },
    { question: "JavaScript is used for?", options: ["Structure", "Styling", "Logic", "Design"], correct: 2 },
    { question: "Which tag links CSS?", options: ["<css>", "<style>", "<link>", "<script>"], correct: 2 },
    { question: "Which is a JS framework?", options: ["React", "HTML", "CSS", "SQL"], correct: 0 },
    { question: "JS single-line comment?", options: ["//", "<!-- -->", "#", "**"], correct: 0 },
    { question: "CSS text color property?", options: ["color", "font", "text-style", "bg"], correct: 0 },
    { question: "Image tag in HTML?", options: ["<img>", "<image>", "<pic>", "<src>"], correct: 0 },
    { question: "Select element by ID?", options: ["getElementById()", "queryAll()", "select()", "getClass()"], correct: 0 },
    { question: "Variable keyword in JS?", options: ["var", "int", "string", "float"], correct: 0 }
];

let index = 0, score = 0, time = 20, timer;
let soundEnabled = true;
let userAnswers = [];

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const timerEl = document.getElementById("timer");
const questionNumEl = document.getElementById("question-number");
const progressEl = document.getElementById("progress");
const resultEl = document.getElementById("result");
const scoreEl = document.getElementById("score");
const percentageEl = document.getElementById("percentage");
const detailResultEl = document.getElementById("detailResult");
const highScoreEl = document.getElementById("highScore");
const badgeEl = document.getElementById("badge");

const reviewEl = document.getElementById("review");
const reviewListEl = document.getElementById("reviewList");

const historyEl = document.getElementById("history");
const historyListEl = document.getElementById("historyList");

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const finishSound = document.getElementById("finishSound");

loadQuestion();
startTimer();

function loadQuestion() {
    clearInterval(timer);
    time = 20;
    startTimer();

    answersEl.innerHTML = "";
    questionEl.textContent = quizData[index].question;
    questionNumEl.textContent = `Question ${index + 1} / ${quizData.length}`;
    progressEl.style.width = `${(index / quizData.length) * 100}%`;

    quizData[index].options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => selectAnswer(btn, i);
        answersEl.appendChild(btn);
    });
}

function startTimer() {
    timerEl.textContent = `⏱ ${time}s`;
    timer = setInterval(() => {
        time--;
        timerEl.textContent = `⏱ ${time}s`;
        if (time === 0) nextQuestion();
    }, 1000);
}

function selectAnswer(button, i) {
    const correctIndex = quizData[index].correct;
    const buttons = answersEl.querySelectorAll("button");

    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIndex) btn.classList.add("correct");
        if (idx === i && i !== correctIndex) btn.classList.add("wrong");
    });

    userAnswers.push({
        question: quizData[index].question,
        selected: quizData[index].options[i],
        correct: quizData[index].options[correctIndex]
    });

    if (i === correctIndex) {
        score++;
        if (soundEnabled) correctSound.play();
    } else {
        if (soundEnabled) wrongSound.play();
    }

    setTimeout(nextQuestion, 1000);
}

function nextQuestion() {
    clearInterval(timer);
    index++;
    if (index < quizData.length) loadQuestion();
    else showResult();
}

function showResult() {
    if (soundEnabled) finishSound.play();

    questionEl.classList.add("hide");
    answersEl.classList.add("hide");
    resultEl.classList.remove("hide");
    progressEl.style.width = "100%";

    const total = quizData.length;
    const percentage = Math.round((score / total) * 100);

    scoreEl.textContent = `Score: ${score} / ${total}`;
    percentageEl.textContent = `Percentage: ${percentage}%`;
    detailResultEl.textContent = `Correct: ${score} | Wrong: ${total - score}`;

    badgeEl.textContent = percentage >= 50 ? "✅ PASS" : "❌ FAIL";
    badgeEl.className = `badge ${percentage >= 50 ? "pass" : "fail"}`;

    const high = localStorage.getItem("highScore") || 0;
    if (percentage > high) {
        localStorage.setItem("highScore", percentage);
        highScoreEl.textContent = `🏆 New High Score: ${percentage}%`;
    } else {
        highScoreEl.textContent = `🏆 High Score: ${high}%`;
    }

    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push({ date: new Date().toLocaleString(), score, total, percentage });
    localStorage.setItem("quizHistory", JSON.stringify(history));
}

function showReview() {
    reviewListEl.innerHTML = "";
    userAnswers.forEach((item, i) => {
        const div = document.createElement("div");
        div.className = "review-item " + (item.selected === item.correct ? "correct" : "wrong");
        div.innerHTML = `<b>Q${i + 1}:</b> ${item.question}<br>
                         Your Answer: ${item.selected}<br>
                         Correct Answer: ${item.correct}`;
        reviewListEl.appendChild(div);
    });
    resultEl.classList.add("hide");
    reviewEl.classList.remove("hide");
}

function showHistory() {
    historyListEl.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.forEach(h => {
        const div = document.createElement("div");
        div.className = "review-item";
        div.innerHTML = `📅 ${h.date}<br>Score: ${h.score}/${h.total} (${h.percentage}%)`;
        historyListEl.appendChild(div);
    });
    resultEl.classList.add("hide");
    historyEl.classList.remove("hide");
}

function restartQuiz() {
    index = 0;
    score = 0;
    userAnswers = [];

    questionEl.classList.remove("hide");
    answersEl.classList.remove("hide");
    resultEl.classList.add("hide");
    reviewEl.classList.add("hide");
    historyEl.classList.add("hide");

    loadQuestion();
}

document.getElementById("darkToggle").onclick = () => {
    document.body.classList.toggle("dark");
};

document.getElementById("soundToggle").onclick = () => {
    soundEnabled = !soundEnabled;
    document.getElementById("soundToggle").textContent = soundEnabled ? "🔊" : "🔇";
};

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Quiz Result Report", 20, 20);
    doc.text(`Score: ${score}/${quizData.length}`, 20, 35);
    doc.text(`Percentage: ${Math.round((score / quizData.length) * 100)}%`, 20, 45);
    doc.text(`Result: ${score >= 5 ? "PASS" : "FAIL"}`, 20, 55);

    doc.save("Quiz_Result.pdf");
}

document.getElementById('correctSound').play();
document.getElementById('wrongSound').play();
document.getElementById('finishSound').play();

function deleteHistory() {
    if (confirm("Are you sure you want to delete all quiz history?")) {
        localStorage.removeItem("quizHistory");
        historyListEl.innerHTML = "";
        alert("Quiz history deleted successfully!");
    }
}

if (!localStorage.getItem("quizHistory")) {
    document.querySelector(".history-buttons button:nth-child(2)").disabled = true;
}

document.getElementById("deleteHistoryBtn").onclick = () => {
    if (confirm("Are you sure you want to delete all quiz history?")) {
        localStorage.removeItem("quizHistory");
        historyListEl.innerHTML = "";
        alert("Quiz history deleted successfully!");
    }
};

if (!localStorage.getItem("quizHistory")) {
    document.getElementById("deleteHistoryBtn").disabled = true;
}

document.getElementById("deleteHistoryTop").onclick = () => {
    if (confirm("Are you sure you want to delete ALL quiz history?")) {
        localStorage.removeItem("quizHistory");  // Delete all stored history
        historyListEl.innerHTML = "";           // Clear history screen if open
        alert("All quiz history has been deleted!");
    }
};

if (!localStorage.getItem("quizHistory")) {
    document.getElementById("deleteHistoryTop").disabled = true;
}

const deleteHistoryBtn = document.getElementById("deleteHistoryBtn");

function updateHistoryScreenButton() {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    if (history.length === 0) {
        deleteHistoryBtn.disabled = true;
        deleteHistoryBtn.style.opacity = 0.5;
        deleteHistoryBtn.title = "No quiz history to delete";
    } else {
        deleteHistoryBtn.disabled = false;
        deleteHistoryBtn.style.opacity = 1;
        deleteHistoryBtn.title = "Delete all quiz history";
    }
}

// Call on page load and after any deletion
updateHistoryScreenButton();

deleteHistoryBtn.onclick = () => {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    if (history.length === 0) {
        alert("No quiz history to delete!");
        return;
    }

    if (confirm("Are you sure you want to delete ALL quiz history?")) {
        localStorage.removeItem("quizHistory");
        historyListEl.innerHTML = "";
        alert("All quiz history has been deleted!");
        updateDeleteHistoryButton();
        updateHistoryScreenButton();
    }
};
