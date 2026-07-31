// ==========================================================
// DOM elements
// ==========================================================
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const itemsLeftEl = document.getElementById("itemsLeft");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

// ==========================================================
// STATE
// tasks = array of objects. Ekta object = ekta task.
// Example: { id: 1690000000, text: "Buy milk", completed: false }
// ==========================================================
let tasks = [];
let currentFilter = "all"; // "all" | "active" | "completed"

// ==========================================================
// LOAD from localStorage (page reload korleo data thake)
// localStorage e sudhu string save kora jay, tai JSON.parse/stringify lagbe
// ==========================================================
function loadTasks() {
  const saved = localStorage.getItem("todo-tasks");
  tasks = saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem("todo-tasks", JSON.stringify(tasks));
}

// ==========================================================
// ADD TASK
// ==========================================================
function addTask() {
  const text = taskInput.value.trim();
  if (text === "") return; // khali input hole kichu korbo na

  // Notun task object banachi, unique id hishebe Date.now() use korlam
  // (Date.now() = ekhon porjonto koto millisecond hoyeche, tai always unique)
  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
  };

  tasks.push(newTask); // array er sesh e notun object jog kora
  taskInput.value = ""; // input box khali kore dilam

  saveTasks();
  render();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

// ==========================================================
// EVENT DELEGATION
// Protyekta task-item e alada alada listener na lagiye,
// pura <ul> (taskList) e ekta e listener lagiye dilam.
// Karon: kono task delete/toggle hole notun render hobe,
// tokhon jodi individual listener thakto, segulo abar lagate hoto.
// Delegation e eta lagey na - parent e ekbar lagale cholbe.
// ==========================================================
taskList.addEventListener("click", (e) => {
  const taskItem = e.target.closest(".task-item");
  if (!taskItem) return; // list er baire click hole kichu na

  const taskId = Number(taskItem.dataset.id); // HTML e data-id attribute theke id pai

  if (e.target.matches(".delete-btn")) {
    deleteTask(taskId);
  } else if (e.target.matches("input[type='checkbox']")) {
    toggleTask(taskId);
  }
});

function deleteTask(id) {
  // filter() diye shudhu oi id chara baki shob rekhe dilam
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

function toggleTask(id) {
  // map() diye protyekta task ghure dekhi, matching id pele completed flip kori
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  render();
}

// ==========================================================
// CLEAR COMPLETED
// ==========================================================
clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

// ==========================================================
// FILTER BUTTONS
// ==========================================================
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter; // "all" / "active" / "completed"

    // Shob button theke .active class soraye dilam, tarpor
    // shudhu jeta click hoyeche shetate add korlam
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    render();
  });
});

// ==========================================================
// RENDER FUNCTION - state onujayi UI update kore
// Eta core concept: data (tasks array) e change korle, sudhu
// render() call korle UI ta niche theke shothik hoye jay.
// ==========================================================
function render() {
  // Step 1: current filter onujayi tasks filter kori
  let filteredTasks = tasks;

  if (currentFilter === "active") {
    filteredTasks = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  }

  // Step 2: filtered list theke HTML string banai
  taskList.innerHTML = filteredTasks
    .map(
      (task) => `
      <li class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
        <input type="checkbox" ${task.completed ? "checked" : ""} />
        <span>${task.text}</span>
        <button class="delete-btn">✕</button>
      </li>
    `
    )
    .join("");

  // Step 3: "X items left" count - reduce() diye completed na thaka task count kori
  const activeCount = tasks.reduce((count, task) => {
    return task.completed ? count : count + 1;
  }, 0);

  itemsLeftEl.textContent = `${activeCount} item${activeCount !== 1 ? "s" : ""} left`;
}

// ==========================================================
// INIT - page load hobar shomoy ekbar chalabo
// ==========================================================
loadTasks();
render();