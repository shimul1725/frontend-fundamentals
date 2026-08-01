// ==========================================================
// QUESTION DATA
// ==========================================================
const questions = [
  {
    question: "Which HTML tag is used to link an external CSS file?",
    options: ["<style>", "<script>", "<link>", "<css>"],
    correctIndex: 2,
  },
  {
    question: "What does DOM stand for?",
    options: [
      "Document Object Model",
      "Data Object Management",
      "Document Oriented Markup",
      "Digital Object Model",
    ],
    correctIndex: 0,
  },
  {
    question: "Which CSS property creates a two-dimensional layout with rows and columns?",
    options: ["flex", "grid", "position", "float"],
    correctIndex: 1,
  },
  {
    question: "Which HTML tag is used for the most important heading on a page?",
    options: ["<head>", "<h6>", "<h1>", "<header>"],
    correctIndex: 2,
  },
  {
    question: "Which CSS property controls the space INSIDE an element's border?",
    options: ["margin", "padding", "spacing", "gap"],
    correctIndex: 1,
  },
  {
    question: "Which value of `position` removes an element from normal document flow and positions it relative to its nearest positioned ancestor?",
    options: ["static", "relative", "absolute", "sticky"],
    correctIndex: 2,
  },
  {
    question: "In Flexbox, which property aligns items along the CROSS axis?",
    options: ["justify-content", "align-items", "flex-direction", "flex-wrap"],
    correctIndex: 1,
  },
  {
    question: "Which HTML element is used to display an image?",
    options: ["<image>", "<img>", "<src>", "<picture-tag>"],
    correctIndex: 1,
  },
  {
    question: "Which CSS selector targets an element on mouse hover?",
    options: [":focus", ":active", ":hover", ":visited"],
    correctIndex: 2,
  },
  {
    question: "Which CSS unit is relative to the root element's font size?",
    options: ["em", "rem", "vh", "px"],
    correctIndex: 1,
  },
  {
    question: "Which array method returns a NEW array with only elements that pass a test?",
    options: ["map()", "forEach()", "reduce()", "filter()"],
    correctIndex: 3,
  },
  {
    question: "What keyword declares a variable that CANNOT be reassigned?",
    options: ["var", "let", "const", "static"],
    correctIndex: 2,
  },
];

const TIME_PER_QUESTION = 15; // seconds

// ==========================================================
// DOM elements
// ==========================================================
const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const questionCounterEl = document.getElementById("questionCounter");
const scoreDisplayEl = document.getElementById("scoreDisplay");
const questionTextEl = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const timerFillEl = document.getElementById("timerFill");
const timerTextEl = document.getElementById("timerText");

const finalScoreEl = document.getElementById("finalScore");
const resultMessageEl = document.getElementById("resultMessage");

// ==========================================================
// STATE
// timerInterval e setInterval() er reference rakhi, jate
// পরে clearInterval() diye seta thamano jay
// ==========================================================
let currentIndex = 0;
let score = 0;
let timeLeft = TIME_PER_QUESTION;
let timerInterval = null;
let hasAnswered = false;

// ==========================================================
// SCREEN NAVIGATION
// ==========================================================
function showScreen(screen) {
  [startScreen, quizScreen, resultScreen].forEach((s) => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", startQuiz);

// ==========================================================
// START QUIZ - state reset kore prothom question theke shuru
// ==========================================================
function startQuiz() {
  currentIndex = 0;
  score = 0;
  showScreen(quizScreen);
  loadQuestion();
}

// ==========================================================
// LOAD QUESTION
// ==========================================================
function loadQuestion() {
  hasAnswered = false;
  const q = questions[currentIndex];

  questionCounterEl.textContent = `Question ${currentIndex + 1}/${questions.length}`;
  scoreDisplayEl.textContent = `Score: ${score}`;
  questionTextEl.textContent = q.question;

  // Age er option button gulo mucche notun kore banai
  optionsContainer.innerHTML = "";

  q.options.forEach((optionText, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = optionText;

    // ==========================================================
    // CLOSURE - eta ekhane khub important concept.
    // Ei arrow function ("index" chapleo ki hobe) - eta ekhane
    // define hocche kintu run hobe onek pore, jokhon user click korbe.
    // Tobuo eta "index" ar "q" variable mone rakhbe - eta e closure.
    // Protyekta button er জন্য আলাদা "index" value আলাদা kore
    // capture hoye thake, karon forEach er প্রতি iteration e notun
    // scope toiri hoy.
    // ==========================================================
    btn.addEventListener("click", () => handleAnswer(index, q.correctIndex, btn));

    optionsContainer.appendChild(btn);
  });

  startTimer();
}

// ==========================================================
// TIMER LOGIC - setInterval()
// ==========================================================
function startTimer() {
  timeLeft = TIME_PER_QUESTION;
  updateTimerDisplay();

  // Age theke kono timer chalu thakle age seta bondho kori,
  // na hole multiple interval ekshathe chalte thakbe (common bug!)
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleAnswer(-1, questions[currentIndex].correctIndex, null); // -1 = kono answer select kora hoyni
    }
  }, 1000); // protyek 1000ms (1 second) e ei function call hobe
}

function updateTimerDisplay() {
  const percentage = (timeLeft / TIME_PER_QUESTION) * 100;
  timerFillEl.style.width = `${percentage}%`;
  timerTextEl.textContent = `${timeLeft}s`;

  // Shesh 5 second e laal color kore warning dei
  timerFillEl.classList.toggle("urgent", timeLeft <= 5);
}

// ==========================================================
// HANDLE ANSWER
// selectedIndex = -1 hote pare jodi time out hoye jay (kono
// answer select kora hoyni)
// ==========================================================
function handleAnswer(selectedIndex, correctIndex, clickedBtn) {
  // Ekbar answer select korle abar select kora jabe na
  if (hasAnswered) return;
  hasAnswered = true;

  clearInterval(timerInterval); // time thamiye dei, karon answer hoye geche

  const allButtons = document.querySelectorAll(".option-btn");

  // Shob button e disable + color feedback dekhai
  allButtons.forEach((btn, index) => {
    btn.disabled = true;

    if (index === correctIndex) {
      btn.classList.add("correct"); // shothik uttor shobshomoy green
    } else if (index === selectedIndex) {
      btn.classList.add("wrong"); // user er bhul choice thakle red
    }
  });

  if (selectedIndex === correctIndex) {
    score++;
    scoreDisplayEl.textContent = `Score: ${score}`;
  }

  // ==========================================================
  // setTimeout() - 1.2 second wait kore পরের question e jabo,
  // jate user color feedback dekhar shomoy pay
  // ==========================================================
  setTimeout(() => {
    goToNextQuestion();
  }, 1200);
}

// ==========================================================
// NEXT QUESTION or FINISH
// ==========================================================
function goToNextQuestion() {
  currentIndex++;

  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

// ==========================================================
// SHOW RESULT
// ==========================================================
function showResult() {
  showScreen(resultScreen);
  finalScoreEl.textContent = `${score}/${questions.length}`;

  const percentage = (score / questions.length) * 100;
  let message;

  if (percentage === 100) message = "Perfect score! You know your fundamentals. 🌟";
  else if (percentage >= 60) message = "Good job! A little more practice and you'll master it.";
  else message = "Keep practicing — you'll get there!";

  resultMessageEl.textContent = message;
}