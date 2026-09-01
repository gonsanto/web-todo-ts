import './style.css'
import { elements } from './dom.ts'

const { input, addButton, deleteAllButton, todoList, errorMessage } = elements

// localStorage.removeItem("todos")

type Todo = {
  id: number
  text: string
  isDone: boolean
}

let isStorageSafe = true

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
    isStorageSafe = false
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

function saveTodos(): boolean {
  if (!isStorageSafe) {
    console.warn(
      'Storage read failed. To prevent data loss writing is disabled',
    )
    return false
  }
  try {
    localStorage.setItem('todos', JSON.stringify(todos))
    return true
  } catch {
    console.warn('Storage data exceeded or unavailable')
    return false
  }
}

function addTask(el: Todo) {
  const todoElements = document.createElement('li')
  todoElements.id = `todo-elements-${el.id}`

  const checkbox = document.createElement('input')
  Object.assign(checkbox, { type: 'checkbox', checked: el.isDone })

  const textSpan = document.createElement('span')
  textSpan.textContent = el.text

  const removeButton = document.createElement('button')
  removeButton.textContent = '🗑'
  removeButton.style.cursor = 'pointer'

  checkbox.addEventListener('change', () => {
    const previousState = el.isDone
    el.isDone = checkbox.checked

    const savedData = saveTodos()

    if (!savedData) {
      el.isDone = previousState
      checkbox.checked = previousState
      alert('Storage is full or unavailable! Changes could not be saved.')
    }
    // console.log(JSON.stringify(el))
  })
  removeButton.addEventListener('click', () => {
    removeElement(el.id)
  })

  todoElements.appendChild(checkbox)
  todoElements.appendChild(textSpan)
  todoElements.appendChild(removeButton)
  todoList.appendChild(todoElements)
}

function addNewElement() {
  errorMessage.textContent = ''
  input.classList.remove('input--error')

  const inputValue = input.value
  if (!(inputValue.trim() === '')) {
    const maxId =
      todos.length > 0 ? Math.max(...todos.map((todo) => todo.id)) : -1
    const newTodo = {
      id: maxId + 1,
      text: inputValue,
      isDone: false,
    }
    todos.push(newTodo)
    const savedData = saveTodos()

    if (savedData) {
      renderTodos()
    } else {
      todos.pop()
      errorMessage.textContent = 'Storage is full! Could not save new task.'
    }
  } else {
    input.classList.add('input--error')
    errorMessage.textContent = 'The input should not be empty !'
    input.blur()
  }
  input.value = ''
}

function removeElement(id: number) {
  const index = todos.findIndex((todo) => todo.id === id)
  if (index === -1) return

  const deletedTodo = todos[index]
  todos.splice(index, 1)

  const savedData = saveTodos()

  if (savedData) {
    renderTodos()
  } else {
    todos.splice(index, 0, deletedTodo)
    alert('Storage is full or unavailable! Could not remove task.')
  }
}

function clearElements() {
  if (todos.length === 0) return

  todos.splice(0, JSON.stringify(todos).length)

  const oldTodos = [...todos]
  const savedData = saveTodos()

  if (savedData) {
    renderTodos()
  } else {
    todos.push(...oldTodos)
    alert('Storage is unavailable! Could not clear task.')
  }
}
renderTodos()

input.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    addNewElement()
  }
})
addButton.addEventListener('click', addNewElement)

deleteAllButton.addEventListener('click', () => {
  clearElements()
})
