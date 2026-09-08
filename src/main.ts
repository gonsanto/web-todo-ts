import './style.css'
import { getCurrentDate, getDueDateStatus } from './date.ts'
import { elements } from './dom.ts'
import { getStoredTodos, isSaveTodo } from './storage.ts'
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

const todos: Todo[] = getStoredTodos()

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

    const savedData = isSaveTodo(todos)

    if (!savedData) {
      el.isDone = previousState
      checkbox.checked = previousState
      alert('Storage is full or unavailable! Changes could not be saved.')
    }
    updateOverdueTask()
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
  const hasOverdueTasks = todos.some(
    (todo) =>
      !todo.isDone && getDueDateStatus(todo.dueDate) === 'due-date--overdue',
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
  const savedData = isSaveTodo(todos)

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

  const savedData = isSaveTodo(todos)

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

  const savedData = isSaveTodo(todos)

  if (savedData) {
    renderTodos()
  } else {
    todos.push(...oldTodos)
    alert('Storage is unavailable! Could not clear task.')
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
