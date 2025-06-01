let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const productInput = document.getElementById("productInput");
const amountInput = document.getElementById("amountInput");
const CATEGORY_LABELS = {
  "Groceries": "רשימת קניות",
  "General": "כללי"
};

categorySelect.addEventListener("change", () => {
  const isGrocery = categorySelect.value === "Groceries";
  productInput.classList.toggle("hidden", !isGrocery);
  amountInput.classList.toggle("hidden", !isGrocery);
  taskInput.classList.toggle("hidden", isGrocery);
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const category = categorySelect.value;

  const text = taskInput.value.trim();
  const product = productInput.value.trim();
  const amount = amountInput.value.trim();

  if ((category === CATEGORY_LABELS.Groceries && (!product || !amount)) ||
      (category !== CATEGORY_LABELS.Groceries && !text)) return;

  const newTask = {
    id: Date.now(),
    text,
    product,
    amount,
    category,
    completed: false,
    completedAt: null
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  productInput.value = "";
  amountInput.value = "";
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newText = prompt("Edit task", task.text || task.product);
  if (newText !== null) {
    if (task.category === CATEGORY_LABELS.Groceries) {
      const newAmount = prompt("Edit amount", task.amount);
      if (newAmount !== null) {
        task.product = newText;
        task.amount = newAmount;
      }
    } else {
      task.text = newText;
    }
    saveTasks();
    renderTasks();
  }
}

function moveToCompleted(id) {
  const task = tasks.find(t => t.id === id);
  if (task && task.completed && !task.completedAt) {
    task.completedAt = new Date().toISOString();
    saveTasks();
    renderTasks();
  }
}

function renderTasks() {
  const container = document.getElementById("taskLists");
  container.innerHTML = "";

  const categories = [...new Set(tasks.map(t => t.category))];

  categories.forEach(category => {
    const section = document.createElement("div");
    section.className = "task-list-section";

    const title = document.createElement("h2");
    title.textContent = CATEGORY_LABELS[category] || category;
    section.appendChild(title);

    const categoryTasks = tasks.filter(t => t.category === category && !t.completedAt);

    if (category === CATEGORY_LABELS.Groceries) {
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      thead.innerHTML = "<tr><th>✔</th><th>מוצר</th><th>כמות</th><th>פעולות</th></tr>";
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      categoryTasks.forEach(task => {
        const tr = document.createElement("tr");

        const checkboxTd = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => toggleTask(task.id);
        checkboxTd.appendChild(checkbox);
        tr.appendChild(checkboxTd);

        tr.innerHTML += `<td>${task.product}</td><td>${task.amount}</td>`;

        const actions = document.createElement("td");
        actions.className = "task-controls";

        if (task.completed && !task.completedAt) {
          const moveBtn = document.createElement("button");
          moveBtn.textContent = "➡️";
          moveBtn.onclick = () => moveToCompleted(task.id);
          actions.appendChild(moveBtn);
        }

        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.onclick = () => editTask(task.id);
        actions.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.onclick = () => deleteTask(task.id);
        actions.appendChild(delBtn);

        tr.appendChild(actions);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      section.appendChild(table);
    } else {
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      thead.innerHTML = "<tr><th>✔</th><th>משימה</th><th style='width: 120px;'>פעולות</th></tr>";
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      categoryTasks.forEach(task => {
        const tr = document.createElement("tr");

        const checkboxTd = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => toggleTask(task.id);
        checkboxTd.appendChild(checkbox);
        tr.appendChild(checkboxTd);

        const taskTd = document.createElement("td");
        taskTd.textContent = task.text;
        tr.appendChild(taskTd);

        const actionsTd = document.createElement("td");
        actionsTd.className = "task-controls";
        actionsTd.style.textAlign = "center";

        if (task.completed && !task.completedAt) {
          const moveBtn = document.createElement("button");
          moveBtn.textContent = "➡️";
          moveBtn.onclick = () => moveToCompleted(task.id);
          actionsTd.appendChild(moveBtn);
        }

        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.onclick = () => editTask(task.id);
        actionsTd.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.onclick = () => deleteTask(task.id);
        actionsTd.appendChild(delBtn);

        tr.appendChild(actionsTd);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      section.appendChild(table);
    }

    container.appendChild(section);
  });

  renderCompletedTasks();
}

function exportCompletedTasks() {
  const completed = tasks.filter(t => t.completedAt);
  if (completed.length === 0) return;

  const blob = new Blob([JSON.stringify(completed, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `completed_tasks_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // Clear completed tasks
  tasks = tasks.filter(t => !t.completedAt);
  saveTasks();
  renderTasks();
}



function renderCompletedTasks() {
  const container = document.getElementById("completedTasks");
  container.innerHTML = "";

  const completed = tasks.filter(t => t.completedAt);

  if (completed.length === 0) {
    container.innerHTML = "<p>אין משימות שהושלמו</p>";
    return;
  }

  const ul = document.createElement("ul");
  completed.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.category === "Groceries"
      ? `${task.product} - ${task.amount} ✅`
      : `${task.text} ✅`;
    ul.appendChild(li);
  });

  container.appendChild(ul);

  // ➕ Add Export Button in Bottom-Left
  const exportWrapper = document.createElement("div");
  exportWrapper.style.display = "flex";
  exportWrapper.style.justifyContent = "flex-start";
  exportWrapper.style.marginTop = "10px";

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "📁 ייצוא JSON";
  exportBtn.onclick = exportCompletedTasks;

  exportWrapper.appendChild(exportBtn);
  container.appendChild(exportWrapper);
}

renderTasks();

function applyResponsiveStyles() {
  const isMobile = window.innerWidth <= 600;

  document.body.classList.toggle("mobile", isMobile);

  const elements = document.querySelectorAll("input, select, button, h1, h2");
  elements.forEach(el => {
    el.style.fontSize = isMobile ? "1.1rem" : "1rem";
  });

  const containers = document.querySelectorAll(".task-list-section, .input-row");
  containers.forEach(el => {
    el.style.flexDirection = isMobile ? "column" : "row";
  });
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const isGrocery = categorySelect.value === "Groceries";
    const isValid =
      (isGrocery && productInput.value.trim() && amountInput.value.trim()) ||
      (!isGrocery && taskInput.value.trim());

    if (isValid) {
      event.preventDefault(); // prevent accidental form submissions
      addTask();
    }
  }
});

window.addEventListener("resize", applyResponsiveStyles);
window.addEventListener("load", applyResponsiveStyles);
