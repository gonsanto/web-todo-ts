import './style.css';

const input = document.getElementById("todo-input") as HTMLInputElement;
const button = document.getElementById("add-todo-button") as HTMLButtonElement;
const todoList = document.getElementById("todo-list") as HTMLUListElement;
const errorMessage = document.getElementById("todo-error") as HTMLParagraphElement;

const listTodo: string[] = [];

function check(): void {
  if (!input || !todoList || !errorMessage) return;
  errorMessage.textContent = "";
  input.classList.remove("input--error");

  if (input.value.trim() === "") {
    errorMessage.textContent = "The input should not be empty !";
    input.classList.add("input--error");
    errorMessage.style.color = "rgba(255, 0, 0, 0.7)";
    input.blur();
  } else {
    listTodo.push(input.value.trim());

    todoList.innerHTML = ` 
      ${listTodo.map((el: string): string => `<li id="todo-elements">${el}</li>`).join("")}
    `;

    input.value = "";
    input.focus();
  }
}

input.addEventListener("keydown", (e: KeyboardEvent): void => {
  if (e.key === "Enter") {
    check();
  }
});

button.addEventListener("click", check);
