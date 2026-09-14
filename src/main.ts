import './style.css'
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
import { hideLoadingSpinner, showLoadingSpinner } from './updateUi.ts'

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
  errorMessage.textContent =
    'Failed to load todos from the server. Please try again later.'
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
    showLoadingSpinner()
    const checkboxDone = await apiUpdateTodo(el.id, { done: checkbox.checked })
    hideLoadingSpinner()
    if (checkboxDone) {
      el.done = checkbox.checked
      updateOverdueTask()
    }
  })
  removeButton.addEventListener('click', async () => {
    showLoadingSpinner()
    const removeCheck = await apiDeleteTodo(el.id)
    hideLoadingSpinner()
    if (removeCheck) {
      removeElement(el.id)
      renderTodos()
    } else {
      errorMessage.textContent = 'Failed to delete todo from the server'
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
let isAdding = false
async function addNewElement() {
  if (isAdding) return

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
  try {
    isAdding = true
    showLoadingSpinner()
    const createdTodo = await apiAddTodo(newTodoAPI)

    if (createdTodo) {
      todos.push(createdTodo)
      renderTodos()
      input.value = ''
      dateInput.value = ''
    } else {
      errorMessage.textContent = 'Failed to save new todo to the server.'
    }
  } catch (error) {
    console.error('Failes to add task', error)
  } finally {
    isAdding = false
    hideLoadingSpinner()
  }
}

function removeElement(id: number) {
  const index = todos.findIndex((todo) => todo.id === id)
  if (index === -1) return
  todos.splice(index, 1)
}

async function clearElements() {
  if (todos.length === 0) return
  showLoadingSpinner()
  const clearCheck = await apiClearTodo()
  hideLoadingSpinner()
  if (clearCheck) {
    todos.splice(0, todos.length)
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
