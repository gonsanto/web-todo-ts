import { apiUpdateTodo } from './api/todoApi'

import { state } from './state'
import { scheduleDelete } from './ui/toast'

import {
  hideLoadingSpinner,
  showLoadingSpinner,
  updateOverdueTask,
} from './ui/updateUi'
import { constants } from './utils/constants'

import { createDateElement, getDueDateStatus } from './utils/date'
import { elements } from './utils/dom'
import type { Todo } from './utils/types'

const {
  hasAssignedCategoryClass,
  baseColorInputValue,
  baseCategoryColor,
  categoryElText,
  noAssignedCategoryClass,
  removeButtonText,
  failedTo,
} = constants
const { todoList, todoErrorMessage } = elements

export const addTask = (todo: Todo) => {
  const todoElements = document.createElement('li')
  todoElements.id = `todo-elements-${todo.id}`
  todoElements.classList.add(getDueDateStatus(todo.due_date))

  const checkbox = document.createElement('input')
  Object.assign(checkbox, { type: 'checkbox', checked: todo.done })

  const textSpan = document.createElement('span')
  textSpan.textContent = todo.title

  const removeButton = document.createElement('button')
  removeButton.textContent = removeButtonText

  const dateEl = createDateElement(todo)
  const categoryEl = applyCategoryElement(todo, todoElements)

  checkbox.addEventListener('change', async () => {
    const submit = checkbox.checked
    checkbox.disabled = true
    showLoadingSpinner()
    try {
      const checkboxDone = await apiUpdateTodo(todo.id, { done: submit })
      if (checkboxDone) {
        todo.done = submit
        updateOverdueTask()
      } else if (checkbox.checked === submit) {
        checkbox.checked = !submit
        todoErrorMessage.textContent = failedTo.update.todo
      }
    } finally {
      checkbox.disabled = false
      hideLoadingSpinner()
    }
  })

  removeButton.addEventListener('click', async () => {
    await scheduleDelete([todo], todo.title, categoryEl)
  })

  todoElements.appendChild(checkbox)
  todoElements.appendChild(categoryEl)
  todoElements.appendChild(textSpan)
  if (dateEl) {
    todoElements.appendChild(dateEl)
  }
  todoElements.appendChild(removeButton)
  todoList.appendChild(todoElements)
}

export const applyCategoryElement = (todo: Todo, todoElements: HTMLElement) => {
  const link = state.categoriesTodos.find((ct) => ct.todo_id === todo.id)
  const category = link
    ? state.categories.find((c) => c.id === link.category_id)
    : undefined

  const categoryEl = document.createElement('span')

  if (category) {
    const categoryColor = category.color

    categoryEl.classList.add(hasAssignedCategoryClass)
    categoryEl.textContent = category.title
    if (categoryColor === baseColorInputValue) {
      categoryEl.style.borderColor = baseCategoryColor
      categoryEl.style.background = baseCategoryColor
      todoElements.style.borderColor = baseCategoryColor
    } else {
      categoryEl.style.borderColor = categoryColor
      categoryEl.style.background = categoryColor
      todoElements.style.borderColor = categoryColor
    }
  } else {
    categoryEl.textContent = categoryElText
    categoryEl.classList.add(noAssignedCategoryClass)
  }

  return categoryEl
}
