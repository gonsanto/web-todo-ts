import './style.css'
import { elements } from './dom.ts'

const { input, addButton, deleteAllButton, todoList, errorMessage, dateInput, overdueMessage } =
  elements

type Todo = {
  id: number
  text: string
  isDone: boolean
  dueDate: string
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
          typeof todo.isDone === 'boolean' &&
          typeof todo.dueDate === 'string',
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
  updateOverdueTask()
}

function isSaveTodo(): boolean {
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
  todoElements.classList.add(getDueDateStatus(el.dueDate))

  const checkbox = document.createElement('input')
  Object.assign(checkbox, { type: 'checkbox', checked: el.isDone })

  const textSpan = document.createElement('span')
  textSpan.textContent = el.text

  const removeButton = document.createElement('button')
  removeButton.textContent = '🗑'
  removeButton.style.cursor = 'pointer'

  const dateEl = createDateElement(el)

  checkbox.addEventListener('change', () => {
    const previousState = el.isDone
    el.isDone = checkbox.checked

    const savedData = isSaveTodo()

    if (!savedData) {
      el.isDone = previousState
      checkbox.checked = previousState
      alert('Storage is full or unavailable! Changes could not be saved.')
    }
    renderTodos()
  })
  removeButton.addEventListener('click', () => {
    removeElement(el.id)
  })

  todoElements.appendChild(checkbox)
  todoElements.appendChild(textSpan)
  if (dateEl) {
    todoElements.appendChild(dateEl)
  }
  todoElements.appendChild(removeButton)
  todoList.appendChild(todoElements)
}

function createDateElement(el: Todo) {
  if (!el.dueDate) {
    const noDueDate = document.createElement('p')
    noDueDate.textContent = 'no due date'
    return noDueDate
  }

  const timeEl = document.createElement('time')
  timeEl.textContent = el.dueDate

  return timeEl
}

function updateOverdueTask() {
  const hasOverdueTasks = todos.some((todo) => !todo.isDone && getDueDateStatus(todo.dueDate) === 'due-date--overdue')
  if (hasOverdueTasks) {
    overdueMessage.textContent = 'Attention: You have overdue tasks that require your immediate attention!'
    overdueMessage.style.display = 'block'
  } else {
    overdueMessage.textContent = ''
    overdueMessage.style.display = 'none'
  }
}

function addNewElement() {
  errorMessage.textContent = ''
  input.classList.remove('input--error')
  dateInput.classList.remove('input--error')

  const inputValue = input.value
  const dueDateValue = dateInput.value

  if (inputValue.trim() === '') {
    input.classList.add('input--error')
    dateInput.classList.add('input--error')
    errorMessage.textContent = 'The input should not be empty !'
    input.blur()
    return
  }
  if (dueDateValue) {
    const dateNow = getCurrentDate()
    if (dueDateValue < dateNow) {
      dateInput.classList.add('input--error')
      input.classList.add('input--error')
      errorMessage.textContent = 'Due date cannot be in the past !'
      return
    }
  }

  const lastId: number =
    todos.length > 0 ? Math.max(...todos.map((todo) => todo.id)) : -1
  const newTodo = {
    id: lastId + 1,
    text: inputValue,
    isDone: false,
    dueDate: dueDateValue,
  }
  todos.push(newTodo)
  const savedData = isSaveTodo()

  if (savedData) {
    renderTodos()
  } else {
    todos.pop()
    errorMessage.textContent = 'Storage is full! Could not save new task.'
  }
  input.value = ''
  dateInput.value = ''
}

function removeElement(id: number) {
  const index = todos.findIndex((todo) => todo.id === id)
  if (index === -1) return

  const deletedTodo = todos[index]
  todos.splice(index, 1)

  const savedData = isSaveTodo()

  if (savedData) {
    renderTodos()
  } else {
    todos.splice(index, 0, deletedTodo)
    alert('Storage is full or unavailable! Could not remove task.')
  }
}

function clearElements() {
  if (todos.length === 0) return
  const oldTodos = [...todos]

  todos.splice(0, todos.length)

  const savedData = isSaveTodo()

  if (savedData) {
    renderTodos()
  } else {
    todos.push(...oldTodos)
    alert('Storage is unavailable! Could not clear task.')
  }
}

function getCurrentDate(): string {
  return new Date().toLocaleDateString('en-CA')
}

function getDueDateStatus(el: string) {
  if (!el) {
    return 'no-due-date'
  }

  const dateNow = getCurrentDate()
  let dueDate: string

  if (el === dateNow) {
    dueDate = 'today'
  } else if (el < dateNow) {
    dueDate = 'overdue'
  } else {
    const dueDateObj = new Date(el)
    const todayObj = new Date(dateNow)
    const milisecondsToDay = 1000 * 60 * 60 * 24

    const diffTime = dueDateObj.getTime() - todayObj.getTime()
    const diffDays = Math.round(diffTime / milisecondsToDay)

    if (diffDays >= 1 && diffDays <= 4) {
      dueDate = 'soon'
    } else {
      dueDate = 'later'
    }
  }
  return `due-date--${dueDate}`
}

let lastKnownDate = getCurrentDate()
window.addEventListener('focus', () => {
  const currentDate = getCurrentDate()
  if (currentDate !== lastKnownDate) {
    lastKnownDate = currentDate
    renderTodos()
  }
})
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
