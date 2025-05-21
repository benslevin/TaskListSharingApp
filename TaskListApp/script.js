function addTask() {
    const input = document.getElementById("taskInput");
    const taskText = input.value.trim();
    if (!taskText) return;
  
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    li.appendChild(checkbox);
  
    const text = document.createTextNode(" " + taskText);
    li.appendChild(text);
  
    document.getElementById("taskList").appendChild(li);
    input.value = "";
  }
  