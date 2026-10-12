import './style.css'

import { addApiCategories, getApiCategories } from './api/categoryApi'
import {
  addApiCategoriesTodos,
  getApiCategoriesTodos,
} from './api/categoryTodoApi'
import { apiAddTodo, getStoredTodos } from './api/todoApi'
import { clearCategories, editCategory } from './categories'
import { renderCategories, renderTodos } from './render'
import { state } from './state.ts'
import { commitPendingTodos, scheduleDelete } from './ui/toast'
import {
  applyCategoryInputColor,
  hideLoadingSpinner,
  showLoadingSpinner,
} from './ui/updateUi'
import { constants } from './utils/constants'
import { getCurrentDate } from './utils/date'
import { elements } from './utils/dom'

const {
  todoInput,
  categoryInput,
  todoCategoryInput,
  addTodoButton,
  addCategoryButton,
  todoErrorMessage,
  categoryErrorMessage,
  dateInput,
  colorInput,
  deleteAllTodosButton,
  deleteAllCategoriesButton,
} = elements
const {
  baseColorInputValue,
  toastDeleteAllText,
  emptyValue,
  inputErrorClass,
  invalid,
  failedTo,
  keyboardKey,
} = constants

colorInput.value = baseColorInputValue

try {
  showLoadingSpinner()
  state.categoriesTodos = await getApiCategoriesTodos()
  state.categoriesTodosLoaded = true
} catch {
  todoErrorMessage.textContent = failedTo.load.categoryTodo
} finally {
  hideLoadingSpinner()
}

try {
  showLoadingSpinner()
  state.todos = await getStoredTodos()
  state.todosLoaded = true
} catch {
  if (!state.categoriesTodosLoaded) {
    todoErrorMessage.textContent = failedTo.load.anyTodo
  } else {
    todoErrorMessage.textContent = failedTo.load.todo
  }
} finally {
  hideLoadingSpinner()
}

try {
  showLoadingSpinner()
  state.categories = await getApiCategories()
  state.categoriesLoaded = true
} catch {
  categoryErrorMessage.textContent = failedTo.load.category
} finally {
  hideLoadingSpinner()
}

const addNewCategory = async () => {
  if (state.isCategoryPending) return
  state.isCategoryPending = true
  addCategoryButton.disabled = true
  categoryInput.disabled = true
  colorInput.disabled = true

  try {
    categoryErrorMessage.textContent = emptyValue
    categoryInput.classList.remove(inputErrorClass)

    const categoryValue = categoryInput.value.trim()
    const colorValue = colorInput.value

    if (categoryValue === emptyValue) {
      categoryInput.classList.add(inputErrorClass)
      categoryErrorMessage.textContent = invalid.textInput
      return
    }

    showLoadingSpinner()
    const createdCategory = await addApiCategories({
      title: categoryValue,
      color: colorValue,
    })

    if (createdCategory) {
      state.categories.push(createdCategory)
      renderCategories()
      categoryInput.value = emptyValue
      colorInput.value = baseColorInputValue
    } else {
      categoryErrorMessage.textContent = failedTo.save.category
    }
  } catch (error) {
    console.error(failedTo.error.addCategory, error)
  } finally {
    state.isCategoryPending = false
    addCategoryButton.disabled = false
    categoryInput.disabled = false
    colorInput.disabled = false
    hideLoadingSpinner()
  }
}

const addNewElement = async () => {
  if (state.isTodoPending) return
  state.isTodoPending = true

  addTodoButton.disabled = true
  todoInput.disabled = true
  dateInput.disabled = true
  todoCategoryInput.disabled = true

  try {
    todoErrorMessage.textContent = emptyValue
    todoInput.classList.remove(inputErrorClass)
    dateInput.classList.remove(inputErrorClass)

    const inputValue = todoInput.value.trim()
    const dueDateValue = dateInput.value
    const categoryIdValue = todoCategoryInput.value

    if (inputValue === emptyValue) {
      todoInput.classList.add(inputErrorClass)
      if (dueDateValue && dueDateValue < getCurrentDate()) {
        dateInput.classList.add(inputErrorClass)
        todoErrorMessage.textContent = invalid.inputs
      } else {
        todoErrorMessage.textContent = invalid.textInput
      }
      todoInput.blur()
      return
    }

    if (dueDateValue && dueDateValue < getCurrentDate()) {
      dateInput.classList.add(inputErrorClass)
      todoErrorMessage.textContent = invalid.dateInput
      return
    }

    showLoadingSpinner()
    const createdTodo = await apiAddTodo({
      title: inputValue,
      content: emptyValue,
      done: false,
      due_date: dueDateValue || null,
    })

    if (createdTodo) {
      if (categoryIdValue) {
        const assignedCategory = await addApiCategoriesTodos({
          category_id: Number(categoryIdValue),
          todo_id: createdTodo.id,
        })
        if (assignedCategory) {
          state.categoriesTodos.push(assignedCategory)
        } else {
          todoErrorMessage.textContent = failedTo.error.assignCategory
        }
      }
      state.todos.push(createdTodo)
      renderTodos()
      todoCategoryInput.value = emptyValue
      todoCategoryInput.style.backgroundColor = emptyValue
      todoInput.value = emptyValue
      dateInput.value = emptyValue
    } else {
      todoErrorMessage.textContent = failedTo.save.todo
    }
    commitPendingTodos()
  } catch (error) {
    console.error(failedTo.error.addTodo, error)
  } finally {
    state.isTodoPending = false
    addTodoButton.disabled = false
    todoInput.disabled = false
    dateInput.disabled = false
    todoCategoryInput.disabled = false
    hideLoadingSpinner()
  }
}

renderTodos()
renderCategories()

let lastKnownDate = getCurrentDate()

window.addEventListener('focus', async () => {
  const currentDate = getCurrentDate()
  if (currentDate !== lastKnownDate) {
    lastKnownDate = currentDate
    renderTodos()
  }
})

todoCategoryInput.addEventListener('change', () => {
  applyCategoryInputColor()
})

todoInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === keyboardKey.enter) {
    addNewElement()
  }
})

addTodoButton.addEventListener('click', addNewElement)
addCategoryButton.addEventListener('click', () => {
  if (state.isEditingCategory) {
    editCategory()
  } else {
    addNewCategory()
  }
})
categoryInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === keyboardKey.enter) {
    if (state.isEditingCategory) {
      editCategory()
    } else {
      addNewCategory()
    }
  }
})

deleteAllTodosButton.addEventListener('click', async () => {
  if (state.todos.length === 0) return
  await scheduleDelete(
    [...state.todos],
    `${state.todos.length} ${toastDeleteAllText}`,
  )
})
deleteAllCategoriesButton.addEventListener('click', clearCategories)

window.addEventListener('beforeunload', (e) => {
  if (state.pendingDeletes.length > 0) {
    e.preventDefault()
    e.returnValue = ''
  }
})
