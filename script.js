// script.js

const startScreen = document.getElementById("startScreen");
const quizEl = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("nextBtn");
const viewResultsBtn = document.getElementById("viewResultsBtn");
const questionNumEl = document.getElementById("questionNumber");
const progressBar = document.getElementById("progressBar");
const timerCircle = document.getElementById("timerCircle");
const timerText = document.getElementById("timerText");
const circleTimer = document.querySelector(".circle-timer");
const resultsEl = document.getElementById("results");
const scoreText = document.getElementById("scoreText");
const summaryList = document.getElementById("summary");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const progressWrapper = document.querySelector(".progress-wrapper");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let timeLeft = 10;
let timerInterval;

startBtn.onclick = () => {
  startScreen.classList.add("hidden");
  quizEl.classList.remove("hidden");
  circleTimer.classList.remove("hidden");
  progressWrapper.classList.remove("hidden");
  fetchQuestions();
};

restartBtn.onclick = () => {
  location.reload();
};

async function fetchQuestions() {
  const category = categorySelect.value;
  const difficulty = difficultySelect.value;
  const res = await fetch(
    `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`
  );
  const data = await res.json();
  questions = data.results.map((q) => {
    const choices = shuffle([...q.incorrect_answers, q.correct_answer]);
    return {
      question: decode(q.question),
      choices: choices.map(decode),
      correctAnswer: decode(q.correct_answer),
    };
  });
  startQuiz();
}

function decode(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  displayQuestion();
}

function displayQuestion() {
  clearInterval(timerInterval);
  timeLeft = 10;
  updateTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      userAnswers[currentQuestionIndex] = null;
      goToNext();
    }
  }, 1000);

  const q = questions[currentQuestionIndex];
  questionEl.textContent = q.question;
  questionNumEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  choicesEl.innerHTML = "";
  q.choices.forEach((choice) => {
    const li = document.createElement("li");
    li.textContent = choice;
    li.onclick = () => {
      document.querySelectorAll("#choices li").forEach((el) => el.classList.remove("selected"));
      li.classList.add("selected");
      userAnswers[currentQuestionIndex] = choice;
    };
    choicesEl.appendChild(li);
  });

  progressBar.style.width = `${(currentQuestionIndex / questions.length) * 100}%`;
}

function updateTimer() {
  timerText.textContent = timeLeft;
  const offset = 188.4 * ((10 - timeLeft) / 10);
  timerCircle.style.strokeDashoffset = offset;
}

nextBtn.onclick = () => {
  if (userAnswers[currentQuestionIndex] == null) {
    alert("Please select an answer.");
    return;
  }
  goToNext();
};

function goToNext() {
  const correct = questions[currentQuestionIndex].correctAnswer;
  const user = userAnswers[currentQuestionIndex];
  if (user === correct) score++;

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    displayQuestion();
    if (currentQuestionIndex === questions.length - 1) {
      nextBtn.style.display = "none";
      viewResultsBtn.style.display = "inline-block";
    }
  } else {
    showResults();
  }
}

viewResultsBtn.onclick = showResults;

function showResults() {
  clearInterval(timerInterval);
  quizEl.classList.add("hidden");
  circleTimer.classList.add("hidden");
  resultsEl.classList.remove("hidden");
  progressBar.style.width = "100%";
  scoreText.textContent = `You scored ${score} out of ${questions.length}`;
  summaryList.innerHTML = "";

  questions.forEach((q, i) => {
    const user = userAnswers[i];
    const isCorrect = user === q.correctAnswer;
    const li = document.createElement("li");
    li.innerHTML = `<strong>Q${i + 1}:</strong> ${q.question}<br>
      Your Answer: <span style="color:${isCorrect ? "lime" : "red"}">
      ${user || "No Answer"}</span><br>
      Correct Answer: ${q.correctAnswer}`;
    summaryList.appendChild(li);
  });
}
