import './style.css'
import { elements } from './dom.ts'

const { input, button, todoList, errorMessage } = elements
let todoEl = 0
// localStorage.removeItem("todos")

type Todo = {
  id: number
  text: string
}

const todos: Todo[] = JSON.parse(localStorage.getItem('todos') ?? '[]')
if (!(todos === null)) {
  todoList.innerHTML = ''
  todos.forEach((Todo) => {
    addTask(Todo)
  })
}

function addTask(el: Todo) {
  const todoElements = document.createElement('li')
  todoElements.id = `todo-elements-${el.id}`
  todoElements.textContent = el.text
  todoList.appendChild(todoElements)
}

function addNewElement() {
  errorMessage.textContent = ''
  input.classList.remove('input--error')

  const inputValue = input.value
  if (!(inputValue.trim() === '')) {
    const newTodo = {
      id: todoEl,
      text: inputValue,
    }
    todos.push(newTodo)
    localStorage.setItem('todos', JSON.stringify(todos))

    todoEl++
    addTask(newTodo)

    //  console.log(JSON.stringify(todos))
  } else {
    input.classList.add('input--error')
    errorMessage.textContent = 'The input should not be empty !'
    input.blur()
  }
  input.value = ''
}

input.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    addNewElement()
  }
})
button.addEventListener('click', addNewElement)