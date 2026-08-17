import './style.css'

const input = document.querySelector<HTMLInputElement>("#todo-input");
const button = document.querySelector("#add-todo-button");
const todoList = document.querySelector("#todo-list");
const errorMessage = document.querySelector("#todo-error");
const listTodo: string[] = [];

function check() {
  if (!input || !todoList || !errorMessage) {
    console.error("One of the input values are null"); return;
  }
  errorMessage.textContent = "";
  input.classList.remove("input--error");

  const inputValue = input.value;

  if (inputValue.trim() === "") {
    input.classList.add("input--error");
    errorMessage.textContent = "The input should not be empty !";
    input.blur();
  } else {
    const todoElements = document.createElement("li");
    todoElements.id = "todo-elements"

    todoElements.textContent = inputValue;
    todoList.appendChild(todoElements);
    input.value = "";
  }
}

input.addEventListener("keydown", (e: KeyboardEvent): void => {
  if (e.key === "Enter") { check(); }
});

button.addEventListener("click", check);
