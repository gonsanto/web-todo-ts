import './style.css'
import { showLoadingSpinner, hideLoadingSpinner } from './updateUi.ts'
import { getCurrentDate, getDueDateStatus } from './date.ts'
import { elements } from './dom.ts'
import {
  apiAddTodo,
  apiClearTodo,
  apiDeleteTodo,
  apiUpdateTodo,
  getStoredTodos,
} from './todoApi.ts'
import type { Todo } from './types.ts'

const {
  input,
  addButton,
  deleteAllButton,
  todoList,
  errorMessage,
  dateInput,
  overdueMessage,
} = elements

let todos: Todo[] = []
try {
  showLoadingSpinner()
  todos = await getStoredTodos()
  renderTodos()
} catch {
  console.error('Failed to load todos')
} finally {
  hideLoadingSpinner()
}

function renderTodos() {
  todoList.innerHTML = ''
  todos.forEach((Todo) => {
    addTask(Todo)
  })
  updateOverdueTask()
}

function addTask(el: Todo) {
  const todoElements = document.createElement('li')
  todoElements.id = `todo-elements-${el.id}`
  todoElements.classList.add(getDueDateStatus(el.due_date))

  const checkbox = document.createElement('input')
  Object.assign(checkbox, { type: 'checkbox', checked: el.done })

  const textSpan = document.createElement('span')
  textSpan.textContent = el.title

  const removeButton = document.createElement('button')
  removeButton.textContent = '🗑'
  removeButton.style.cursor = 'pointer'

  const dateEl = createDateElement(el)

  checkbox.addEventListener('change', async () => {
    el.done = checkbox.checked
    showLoadingSpinner()
    const checkboxDone = await apiUpdateTodo(el.id, { done: checkbox.checked })
    hideLoadingSpinner()
    if (checkboxDone) {
      updateOverdueTask()
    }
  })
  removeButton.addEventListener('click', async () => {
    removeElement(el.id)
    showLoadingSpinner()
    const removeCheck = await apiDeleteTodo(el.id)
    hideLoadingSpinner()
    if (removeCheck) {
      renderTodos()
    }
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
  if (!el.due_date) {
    const noDueDate = document.createElement('p')
    noDueDate.textContent = 'no due date'
    return noDueDate
  }

  const timeEl = document.createElement('time')
  timeEl.textContent = el.due_date

  return timeEl
}

function updateOverdueTask() {
  const hasOverdueTasks = todos.some(
    (todo) =>
      !todo.done && getDueDateStatus(todo.due_date) === 'due-date--overdue',
  )
  if (hasOverdueTasks) {
    overdueMessage.textContent =
      'Attention: You have overdue tasks that require your immediate attention!'
    overdueMessage.style.display = 'block'
  } else {
    overdueMessage.textContent = ''
    overdueMessage.style.display = 'none'
  }
}

async function addNewElement() {
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
  const newTodoAPI = {
    title: inputValue,
    content: '',
    done: false,
    due_date: dueDateValue ? dueDateValue : null,
  }

  const createdTodo = await apiAddTodo(newTodoAPI)

  if (createdTodo) {
    todos.push(createdTodo)
    renderTodos()
  } else {
    errorMessage.textContent = 'Failed to save new task to the server.'
  }
  input.value = ''
  dateInput.value = ''
}

function removeElement(id: number) {
  const index = todos.findIndex((todo) => todo.id === id)
  todos.splice(index, 1)
}

async function clearElements() {
  if (todos.length === 0) return
  todos.splice(0, todos.length)
  showLoadingSpinner()
  const clearCheck = await apiClearTodo()
  hideLoadingSpinner()
  if (clearCheck) {
    renderTodos()
  }
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
