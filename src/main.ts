import './style.css'
import { elements } from './dom.ts'

const { input, button, todoList, errorMessage } = elements

// localStorage.removeItem("todos")

type Todo = {
  id: number
  text: string
  isDone: boolean
}

function getStoredTodos(): Todo[] {
  try {
    const rawData = localStorage.getItem('todos') ?? '[]'
    const parsedData: unknown = JSON.parse(rawData)

    return Array.isArray(parsedData)
      ? parsedData.filter(
          (todo): todo is Todo =>
            typeof todo === 'object' &&
            todo !== null &&
            typeof todo.id === 'number' &&
            typeof todo.text === 'string' &&
            typeof todo.isDone === 'boolean',
        )
      : []
  } catch {
    return []
  }
}
const todos: Todo[] = getStoredTodos()

function renderTodos() {
  todoList.innerHTML = ''
  todos.forEach((Todo) => {
    addTask(Todo)
  })
}

function saveTodos() {
  try {
    localStorage.setItem('todos', JSON.stringify(todos))
  } catch {
    throw new Error('Storage data exceeded or unavailable')
  }
}

function addTask(el: Todo) {
  const todoElements = document.createElement('li')
  todoElements.id = `todo-elements-${el.id}`

  const checkbox = document.createElement('input')
  Object.assign(checkbox, { type: 'checkbox', checked: el.isDone })

  const textSpan = document.createElement('span')
  textSpan.textContent = el.text

  checkbox.addEventListener('change', () => {
    el.isDone = checkbox.checked
    saveTodos()
    // console.log(JSON.stringify(el))
  })

  todoElements.appendChild(checkbox)
  todoElements.appendChild(textSpan)
  todoList.appendChild(todoElements)
}

function addNewElement() {
  errorMessage.textContent = ''
  input.classList.remove('input--error')

  const inputValue = input.value
  if (!(inputValue.trim() === '')) {
    const newTodo = {
      id: todos.length,
      text: inputValue,
      isDone: false,
    }
    todos.push(newTodo)
    saveTodos()

    renderTodos()
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
