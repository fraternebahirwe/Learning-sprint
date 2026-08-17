const storageKey = "learning-sprint-planner-v1";

const focusInput = document.querySelector("#focus-input");
const focusGuidance = document.querySelector("#focus-guidance");
const goalsInput = document.querySelector("#goals-input");
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskTemplate = document.querySelector("#task-template");
const emptyState = document.querySelector("#empty-state");
const taskError = document.querySelector("#task-error");
const progressPercent = document.querySelector("#progress-percent");
const progressSummary = document.querySelector("#progress-summary");
const progressRing = document.querySelector("#progress-ring");
const progressRingLabel = document.querySelector("#progress-ring-label");
const progressVisual = document.querySelector(".progress-visual");

let sprint = loadSprint();

function loadSprint() {
  try {
    const storedSprint = localStorage.getItem(storageKey);
    if (!storedSprint) return { focus: "", goals: "", tasks: [] };

    const parsedSprint = JSON.parse(storedSprint);
    return {
      focus: typeof parsedSprint.focus === "string" ? parsedSprint.focus : "",
      goals: typeof parsedSprint.goals === "string" ? parsedSprint.goals : "",
      tasks: Array.isArray(parsedSprint.tasks) ? parsedSprint.tasks : [],
    };
  } catch {
    return { focus: "", goals: "", tasks: [] };
  }
}

function saveSprint() {
  localStorage.setItem(storageKey, JSON.stringify(sprint));
}

function createTaskId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderTasks() {
  taskList.replaceChildren();

  sprint.tasks.forEach((task) => {
    const item = taskTemplate.content.cloneNode(true);
    const checkbox = item.querySelector(".task-checkbox");
    const label = item.querySelector(".task-label");
    const text = item.querySelector(".task-text");

    checkbox.checked = task.completed;
    checkbox.dataset.taskId = task.id;
    label.htmlFor = `task-${task.id}`;
    checkbox.id = `task-${task.id}`;
    text.textContent = task.text;
    taskList.append(item);
  });

  emptyState.hidden = sprint.tasks.length > 0;
}

function renderProgress() {
  const total = sprint.tasks.length;
  const completed = sprint.tasks.filter((task) => task.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const circumference = 301.593;

  progressPercent.textContent = `${percent}%`;
  progressRingLabel.textContent = `${percent}%`;
  progressRing.style.strokeDashoffset = circumference - (percent / 100) * circumference;
  progressVisual.setAttribute("aria-label", `${percent} percent complete`);

  if (total === 0) {
    progressSummary.textContent = "Add your first task to begin.";
  } else if (completed === total) {
    progressSummary.textContent = `All ${total} task${total === 1 ? "" : "s"} complete — great work!`;
  } else {
    progressSummary.textContent = `${completed} of ${total} task${total === 1 ? "" : "s"} complete`;
  }
}

function renderFocusGuidance() {
  const hasFocus = sprint.focus.trim().length > 0;
  focusGuidance.textContent = hasFocus
    ? "Keep it specific enough to guide this week."
    : "Add a focus area to give your sprint a clear direction.";
  focusGuidance.classList.toggle("is-guidance", !hasFocus);
}

function render() {
  focusInput.value = sprint.focus;
  goalsInput.value = sprint.goals;
  renderFocusGuidance();
  renderTasks();
  renderProgress();
}

focusInput.addEventListener("input", () => {
  sprint.focus = focusInput.value;
  saveSprint();
  renderFocusGuidance();
});

goalsInput.addEventListener("input", () => {
  sprint.goals = goalsInput.value;
  saveSprint();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();

  if (!text) {
    taskError.textContent = "Enter a task before adding it.";
    taskError.hidden = false;
    taskInput.focus();
    return;
  }

  sprint.tasks.push({ id: createTaskId(), text, completed: false });
  taskInput.value = "";
  taskError.hidden = true;
  saveSprint();
  renderTasks();
  renderProgress();
  taskInput.focus();
});

taskInput.addEventListener("input", () => {
  taskError.hidden = true;
});

taskList.addEventListener("change", (event) => {
  if (!event.target.matches(".task-checkbox")) return;

  const task = sprint.tasks.find((item) => item.id === event.target.dataset.taskId);
  if (!task) return;

  task.completed = event.target.checked;
  saveSprint();
  renderProgress();
});

render();
