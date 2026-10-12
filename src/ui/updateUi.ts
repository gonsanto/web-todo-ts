import { state } from '../state'
import { constants } from '../utils/constants'
import { getDueDateStatus } from '../utils/date'
import { elements } from '../utils/dom'

const {
  categoryTodoInputText,
  emptyValue,
  baseColorInputValue,
  baseCategoryTodoBackgroundColor,
  overdueMessageText,
  overdueTaskClass,
  isHiddenClass,
} = constants
const { todoCategoryInput, overdueMessage } = elements

let spinnerCount = 0

export const showLoadingSpinner = () => {
  spinnerCount++
  let overlay = document.querySelector<HTMLElement>('.loading-overlay')

  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = 'loading-overlay'

    const spinner = document.createElement('div')
    spinner.className = 'spinner'

    overlay.appendChild(spinner)
    document.body.appendChild(overlay)
  }
  overlay.style.display = 'flex'
}

export const hideLoadingSpinner = () => {
  spinnerCount = Math.max(0, spinnerCount - 1)
  if (spinnerCount > 0) return
  const overlay = document.querySelector<HTMLElement>('.loading-overlay')
  if (overlay) {
    overlay.style.display = 'none'
  }
}

export const renderCategoryOptions = () => {
  const previous = todoCategoryInput.value

  todoCategoryInput.innerHTML = `<option value="">${categoryTodoInputText}</option>`
  state.categories.forEach((category) => {
    const option = document.createElement('option')
    option.value = `${category.id}`
    option.textContent = category.title
    option.style.backgroundColor = category.color
    todoCategoryInput.appendChild(option)
  })

  const stillValid =
    previous && state.categories.some((c) => String(c.id) === previous)
  todoCategoryInput.value = stillValid ? previous : emptyValue

  applyCategoryInputColor()
}

export const applyCategoryInputColor = () => {
  const selectedId = todoCategoryInput.value

  if (selectedId === emptyValue) {
    todoCategoryInput.style.backgroundColor = emptyValue
    return
  }
  const category = state.categories.find(
    (category) => category.id === Number(selectedId),
  )
  if (!category) return

  if (category.color === baseColorInputValue) {
    todoCategoryInput.style.backgroundColor = baseCategoryTodoBackgroundColor
  } else {
    todoCategoryInput.style.backgroundColor = category.color
  }
}

export const updateOverdueTask = () => {
  const hasOverdueTasks = state.todos.some(
    (todo) =>
      !todo.done && getDueDateStatus(todo.due_date) === overdueTaskClass,
  )
  overdueMessage.textContent = hasOverdueTasks ? overdueMessageText : emptyValue
  overdueMessage.classList.toggle(
    isHiddenClass,
    !hasOverdueTasks || !state.todosLoaded,
  )
}
