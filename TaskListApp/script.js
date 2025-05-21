let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const productInput = document.getElementById("productInput");
const amountInput = document.getElementById("amountInput");

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

  if ((category === "Groceries" && (!product || !amount)) ||
      (category !== "Groceries" && !text)) return;

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
    if (task.category === "Groceries") {
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
    title.textContent = category;
    section.appendChild(title);

    const categoryTasks = tasks.filter(t => t.category === category && !t.completedAt);

    if (category === "Groceries") {
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      thead.innerHTML = "<tr><th>✔</th><th>Product</th><th>Amount</th><th>Actions</th></tr>";
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
      const ul = document.createElement("ul");

      categoryTasks.forEach(task => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => toggleTask(task.id);
        li.appendChild(checkbox);

        const span = document.createElement("span");
        span.textContent = task.text;
        li.appendChild(span);

        const controls = document.createElement("div");
        controls.className = "task-controls";

        if (task.completed && !task.completedAt) {
          const moveBtn = document.createElement("button");
          moveBtn.textContent = "➡️";
          moveBtn.onclick = () => moveToCompleted(task.id);
          controls.appendChild(moveBtn);
        }

        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.onclick = () => editTask(task.id);
        controls.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.onclick = () => deleteTask(task.id);
        controls.appendChild(delBtn);

        li.appendChild(controls);
        ul.appendChild(li);
      });

      section.appendChild(ul);
    }

    container.appendChild(section);
  });

  renderCompletedTasks();
}

function renderCompletedTasks() {
  const container = document.getElementById("completedTasks");
  container.innerHTML = "";

  const completed = tasks.filter(t => t.completedAt);

  if (completed.length === 0) {
    container.innerHTML = "<p>No completed tasks yet.</p>";
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
}

renderTasks();
