import './style.css'
import { elements } from './dom.ts'

const { input, button, todoList, errorMessage } = elements

//  localStorage.removeItem("todos")

type Todo = {
  id: number
  text: string
}

function getStoredTodos(): Todo[] {
  const rawData = localStorage.getItem('todos') ?? '[]'
  let parsedData: unknown

  try {
    parsedData = JSON.parse(rawData)
    return Array.isArray(parsedData)
      ? parsedData.filter(
          (todo): todo is Todo =>
            typeof todo === 'object' &&
            todo !== null &&
            typeof todo.id === 'number' &&
            typeof todo.text === 'string',
        )
      : []
  } catch {
    return []
  }
}
const todos: Todo[] = getStoredTodos()
const todoEl = todos.length

function renderTodos() {
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

    addTask(newTodo)
    //  console.log(JSON.stringify(todos))
  } else {
    input.classList.add('input--error')
    errorMessage.textContent = 'The input should not be empty !'
    input.blur()
  }
  input.value = ''
}
renderTodos()

input.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    addNewElement()
  }
})
button.addEventListener('click', addNewElement)
