import './style.css'
import {
  addApiCategories,
  clearCategories,
  deleteApiCategories,
  getApiCategories,
  updateApiCategories,
} from './categoriesApi.ts'
import {
  addApiCategoriesTodos,
  getApiCategoriesTodos,
} from './categoriesTodoApi.ts'
import { constants } from './constants.ts'
import { getCurrentDate, getDueDateStatus } from './date.ts'
import { elements } from './dom.ts'
import {
  apiAddTodo,
  apiClearTodo,
  apiDeleteTodo,
  apiUpdateTodo,
  getStoredTodos,
} from './todoApi.ts'
import type { Category, Category_Todo, Todo } from './types.ts'
import { hideLoadingSpinner, showLoadingSpinner } from './updateUi.ts'

const {
  todoInput,
  categoryInput,
  todoCategoryInput,
  addTodoButton,
  addCategoryButton,
  todoList,
  categoryList,
  todoErrorMessage,
  categoryErrorMessage,
  dateInput,
  colorInput,
  overdueMessage,
  deleteAllTodosButton,
  deleteAllCategoriesButton,
} = elements

const {
  baseCategoryColor,
  baseColorInputValue,
  baseCategoryTodoBackgroundColor,
  addButtonText,
  editButtonText,
  saveButtonText,
  removeButtonText,
  categoryTodoInputText,
  emptyValue,
  isHiddenClass,
  inputErrorClass,
  isEditingClass,
  overdueTaskClass,
  noDueDateText,
  categoryElText,
  hasAssignedCategoryClass,
  noAssignedCategoryClass,
  overdueMessageText,
  invalid,
  failedTo,
  canNotClear,
  keyboardKey,
} = constants

colorInput.value = baseColorInputValue

let categoriesLoaded = false
const renderCategories = () => {
  categoryList.innerHTML = emptyValue
  categories.forEach((Category) => {
    addCategory(Category)
  })

  const empty = categories.length === 0
  categoryList.classList.toggle(isHiddenClass, empty)
  deleteAllCategoriesButton.classList.toggle(
    isHiddenClass,
    empty || !categoriesLoaded,
  )
  renderCategoryOptions()
}

let categories: Category[] = []
try {
  showLoadingSpinner()
  categories = await getApiCategories()
  categoriesLoaded = true
} catch {
  categoryErrorMessage.textContent = failedTo.load.category
} finally {
  hideLoadingSpinner()
}

let isTodoPending = false
let isCategoryPending = false
let isEditingCategory = false
let editedCategoryId: number | null = null

const addCategory = (el: Category) => {
  const category = document.createElement('li')
  category.id = `categories-elements-${el.id}`
  category.style.backgroundColor = el.color
  category.style.borderColor =
    el.color === baseColorInputValue ? emptyValue : el.color

  const textSpan = document.createElement('span')
  textSpan.textContent = el.title

  const editButton = document.createElement('button')
  editButton.textContent = editButtonText

  const removeButton = document.createElement('button')
  removeButton.textContent = removeButtonText

  editButton.addEventListener('click', () => {
    categoryList.querySelectorAll('li').forEach((li) => {
      li.classList.remove(isEditingClass)
    })
    category.classList.add(isEditingClass)

    editedCategoryId = el.id
    categoryInput.value = el.title
    colorInput.value = el.color
    addCategoryButton.textContent = saveButtonText
    isEditingCategory = true
    categoryInput.focus()
  })

  removeButton.addEventListener('click', async () => {
    showLoadingSpinner()
    try {
      const removeCheck = await deleteApiCategories(el.id)
      if (removeCheck) {
        categoriesTodos = categoriesTodos.filter(
          (ct) => ct.category_id !== el.id,
        )
        removeElement(categories, el.id)
        if (editedCategoryId === el.id) resetEditedCategory()
        renderCategories()
        renderTodos()
      } else {
        categoryErrorMessage.textContent = failedTo.delete.category
      }
    } finally {
      hideLoadingSpinner()
    }
  })

  category.appendChild(textSpan)
  category.appendChild(editButton)
  category.appendChild(removeButton)
  categoryList.appendChild(category)
}

const addNewCategory = async () => {
  if (isCategoryPending) return
  isCategoryPending = true
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
      categories.push(createdCategory)
      renderCategories()
      categoryInput.value = emptyValue
      colorInput.value = baseColorInputValue
    } else {
      categoryErrorMessage.textContent = failedTo.save.category
    }
  } catch (error) {
    console.error(failedTo.error.addCategory, error)
  } finally {
    isCategoryPending = false
    addCategoryButton.disabled = false
    categoryInput.disabled = false
    colorInput.disabled = false
    hideLoadingSpinner()
  }
}

async function editCategory() {
  if (isCategoryPending) return
  if (editedCategoryId === null) return
  isCategoryPending = true
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
    const isSuccess = await updateApiCategories(editedCategoryId, {
      title: categoryValue,
      color: colorValue,
    })

    if (isSuccess) {
      const index = categories.findIndex((c) => c.id === editedCategoryId)
      if (index !== -1) {
        categories[index].title = categoryValue
        categories[index].color = colorValue
      }
      renderCategories()
      renderTodos()
      resetEditedCategory()
    } else {
      categoryErrorMessage.textContent = failedTo.update.category
    }
  } catch (error) {
    console.error(failedTo.error.editCategory, error)
  } finally {
    isCategoryPending = false
    addCategoryButton.disabled = false
    categoryInput.disabled = false
    colorInput.disabled = false
    hideLoadingSpinner()
  }
}

function resetEditedCategory() {
  categoryInput.value = emptyValue
  colorInput.value = baseColorInputValue
  addCategoryButton.textContent = addButtonText
  isEditingCategory = false
  editedCategoryId = null
}

let categoriesTodosLoaded = false
let categoriesTodos: Category_Todo[] = []
try {
  showLoadingSpinner()
  categoriesTodos = await getApiCategoriesTodos()
  categoriesTodosLoaded = true
} catch {
  todoErrorMessage.textContent = failedTo.load.categoryTodo
} finally {
  hideLoadingSpinner()
}

function renderCategoryOptions() {
  const previous = todoCategoryInput.value

  todoCategoryInput.innerHTML = `<option value="">${categoryTodoInputText}</option>`
  categories.forEach((category) => {
    const option = document.createElement('option')
    option.value = `${category.id}`
    option.textContent = category.title
    option.style.backgroundColor = category.color
    todoCategoryInput.appendChild(option)
  })

  const stillValid =
    previous && categories.some((c) => String(c.id) === previous)
  todoCategoryInput.value = stillValid ? previous : emptyValue

  applyCategoryInputColor()
}

let todosLoaded = false
let todos: Todo[] = []
try {
  showLoadingSpinner()
  todos = await getStoredTodos()
  todosLoaded = true
} catch {
  if (!categoriesTodosLoaded) {
    todoErrorMessage.textContent = failedTo.load.anyTodo
  } else {
    todoErrorMessage.textContent = failedTo.load.todo
  }
} finally {
  hideLoadingSpinner()
}

function renderTodos() {
  todoList.innerHTML = emptyValue
  todos.forEach((Todo) => {
    addTask(Todo)
  })
  updateOverdueTask()

  const empty = todos.length === 0
  todoList.classList.toggle(isHiddenClass, empty)
  deleteAllTodosButton.classList.toggle(isHiddenClass, empty || !todosLoaded)
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
  removeButton.textContent = removeButtonText

  const dateEl = createDateElement(el)
  const categoryEl = applyCategoryElement(el, todoElements)

  checkbox.addEventListener('change', async () => {
    const submit = checkbox.checked
    checkbox.disabled = true
    showLoadingSpinner()
    try {
      const checkboxDone = await apiUpdateTodo(el.id, { done: submit })
      if (checkboxDone) {
        el.done = submit
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
    showLoadingSpinner()
    try {
      const removeCheck = await apiDeleteTodo(el.id)
      if (removeCheck) {
        removeElement(todos, el.id)
        categoriesTodos = categoriesTodos.filter(
          (CategoryTodo) => CategoryTodo.todo_id !== el.id,
        ) //filter out the categorie-todo along with the deleted todo
        renderTodos()
      } else {
        todoErrorMessage.textContent = failedTo.delete.todo
      }
    } finally {
      hideLoadingSpinner()
    }
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

function createDateElement(el: Todo) {
  if (!el.due_date) {
    const noDueDate = document.createElement('p')
    noDueDate.textContent = noDueDateText
    return noDueDate
  }

  const timeEl = document.createElement('time')
  timeEl.textContent = el.due_date

  return timeEl
}

function applyCategoryElement(el: Todo, todoElements: HTMLElement) {
  const link = categoriesTodos.find((ct) => ct.todo_id === el.id)
  const category = link
    ? categories.find((c) => c.id === link.category_id)
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

function updateOverdueTask() {
  const hasOverdueTasks = todos.some(
    (todo) =>
      !todo.done && getDueDateStatus(todo.due_date) === overdueTaskClass,
  )
  overdueMessage.textContent = hasOverdueTasks ? overdueMessageText : emptyValue
  overdueMessage.classList.toggle(isHiddenClass, !hasOverdueTasks)
}

function applyCategoryInputColor() {
  const selectedId = todoCategoryInput.value

  if (selectedId === emptyValue) {
    todoCategoryInput.style.backgroundColor = emptyValue
    todoCategoryInput.style.color = emptyValue
    return
  }
  const category = categories.find(
    (category) => category.id === Number(selectedId),
  )
  if (!category) return

  if (category.color === baseColorInputValue) {
    todoCategoryInput.style.backgroundColor = baseCategoryTodoBackgroundColor
  } else {
    todoCategoryInput.style.backgroundColor = category.color
  }
}

async function addNewElement() {
  if (isTodoPending) return
  isTodoPending = true
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
          categoriesTodos.push(assignedCategory)
        } else {
          todoErrorMessage.textContent = failedTo.error.assignCategory
        }
      }
      todos.push(createdTodo)
      renderTodos()
      todoCategoryInput.value = emptyValue
      todoInput.value = emptyValue
      dateInput.value = emptyValue
    } else {
      todoErrorMessage.textContent = failedTo.save.todo
    }
  } catch (error) {
    console.error(failedTo.error.addTodo, error)
  } finally {
    isTodoPending = false
    addTodoButton.disabled = false
    todoInput.disabled = false
    dateInput.disabled = false
    todoCategoryInput.disabled = false
    hideLoadingSpinner()
  }
}

function removeElement(element: Todo[] | Category[], id: number) {
  const index = element.findIndex((el: Todo | Category) => el.id === id)
  if (index === -1) return
  element.splice(index, 1)
}

async function clearElements(list: 'todos' | 'categories') {
  const todosList = 'todos'
  const categoriesList = 'categories'

  if (list === todosList) {
    if (!todosLoaded) {
      todoErrorMessage.textContent = canNotClear.todos
      return
    }
    if (!categoriesTodosLoaded) {
      todoErrorMessage.textContent = canNotClear.categoryTodos
      return
    }
  }
  if (list === categoriesList && !categoriesLoaded) {
    categoryErrorMessage.textContent = canNotClear.categories
    return
  }
  if (list === todosList && todos.length === 0) return
  if (list === categoriesList && categories.length === 0) return

  showLoadingSpinner()
  try {
    if (list === todosList) {
      const clearTodosCheck = await apiClearTodo()

      if (clearTodosCheck) {
        todos.splice(0, todos.length)
        categoriesTodos.splice(0, categoriesTodos.length)
      } else {
        todoErrorMessage.textContent = failedTo.clear.todo
      }
      renderTodos()
    }
    if (list === categoriesList) {
      const clearCategoriesCheck = await clearCategories()
      if (clearCategoriesCheck) {
        categories.splice(0, categories.length)
        categoriesTodos.splice(0, categoriesTodos.length)
        resetEditedCategory()
      } else {
        categoryErrorMessage.textContent = failedTo.clear.category
      }
      renderCategories()
      renderTodos()
    }
  } finally {
    hideLoadingSpinner()
  }
}
renderTodos()
renderCategories()

let lastKnownDate = getCurrentDate()
window.addEventListener('focus', () => {
  const currentDate = getCurrentDate()
  if (currentDate !== lastKnownDate) {
    lastKnownDate = currentDate
    renderTodos()
  }
})

todoCategoryInput.addEventListener('change', applyCategoryInputColor)

todoInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === keyboardKey.enter) {
    addNewElement()
  }
})

addTodoButton.addEventListener('click', addNewElement)
categoryInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === keyboardKey.enter) {
    if (isEditingCategory) {
      editCategory()
    } else {
      addNewCategory()
    }
  }
})
addCategoryButton.addEventListener('click', () => {
  if (isEditingCategory) {
    editCategory()
  } else {
    addNewCategory()
  }
})

deleteAllTodosButton.addEventListener('click', () => {
  clearElements('todos')
})
deleteAllCategoriesButton.addEventListener('click', () => {
  clearElements('categories')
})
