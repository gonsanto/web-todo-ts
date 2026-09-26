import './style.css'
import {
  addApiCategories,
  clearCategories,
  deleteApiCategories,
  getApiCategories,
  updateApiCategories,
} from './categoriesApi.ts'
import { getCurrentDate, getDueDateStatus } from './date.ts'
import { elements } from './dom.ts'
import {
  apiAddTodo,
  apiClearTodo,
  apiDeleteTodo,
  apiUpdateTodo,
  getStoredTodos,
} from './todoApi.ts'
import type { Category, Todo } from './types.ts'
import { hideLoadingSpinner, showLoadingSpinner } from './updateUi.ts'

const {
  todoInput,
  categoryInput,
  addTodoButton,
  addCategoryButton,
  deleteAllButton,
  todoList,
  categoryList,
  todoErrorMessage,
  categoryErrorMessage,
  dateInput,
  colorInput,
  overdueMessage,
} = elements
colorInput.value = '#f9f9f9'

const renderCategories = () => {
  categoryList.innerHTML = ''
  if (categories.length === 0) {
    categoryList.style.display = 'none'
  } else {
    categoryList.style.display = 'flex'
  }
  categories.forEach((Category) => {
    addCategory(Category)
  })
}

let categories: Category[] = []
try {
  showLoadingSpinner()
  categories = await getApiCategories()
} catch {
  console.error('Failed to load categories')
  categoryErrorMessage.textContent =
    'Failed to load categories from the server. Please try again later.'
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

  const textSpan = document.createElement('span')
  textSpan.textContent = el.title

  const editButton = document.createElement('button')
  editButton.textContent = 'edit'
  editButton.style.cursor = 'pointer'

  const removeButton = document.createElement('button')
  removeButton.textContent = '🗑'
  removeButton.style.cursor = 'pointer'

  editButton.addEventListener('click', () => {
    categoryList.querySelectorAll('li').forEach((li) => {
      li.classList.remove('editing')
    })
    category.classList.add('editing')

    editedCategoryId = el.id
    categoryInput.value = el.title
    colorInput.value = el.color
    addCategoryButton.textContent = 'save'
    isEditingCategory = true
    categoryInput.focus()
  })

  removeButton.addEventListener('click', async () => {
    showLoadingSpinner()
    try {
      const removeCheck = await deleteApiCategories(el.id)
      if (removeCheck) {
        removeElement(categories, el.id)
        if (editedCategoryId === el.id) resetEditedCategory()
        renderCategories()
      }
    } catch {
      categoryErrorMessage.textContent =
        'Failed to delete category from the server'
      renderCategories()
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
    categoryErrorMessage.textContent = ''
    categoryInput.classList.remove('input--error')

    const categoryValue = categoryInput.value.trim()
    const colorValue = colorInput.value

    if (categoryValue === '') {
      categoryInput.classList.add('input--error')
      categoryErrorMessage.textContent = 'The input should not be empty !'
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
      categoryInput.value = ''
      colorInput.value = '#f9f9f9'
    } else {
      categoryErrorMessage.textContent =
        'Failed to save new category to the server.'
    }
  } catch (error) {
    console.error('Failed to add category', error)
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
    categoryErrorMessage.textContent = ''
    categoryInput.classList.remove('input--error')

    const categoryValue = categoryInput.value.trim()
    const colorValue = colorInput.value

    if (categoryValue === '') {
      categoryInput.classList.add('input--error')
      categoryErrorMessage.textContent = 'The input should not be empty !'
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
      resetEditedCategory()
    } else {
      categoryErrorMessage.textContent =
        'Failed to update category on the server.'
    }
  } catch (error) {
    console.error('Failed to edit category:', error)
  } finally {
    isCategoryPending = false
    addCategoryButton.disabled = false
    categoryInput.disabled = false
    colorInput.disabled = false
    hideLoadingSpinner()
  }
}

function resetEditedCategory() {
  categoryInput.value = ''
  colorInput.value = '#f9f9f9'
  addCategoryButton.textContent = 'add'
  isEditingCategory = false
  editedCategoryId = null
}

let todos: Todo[] = []
try {
  showLoadingSpinner()
  todos = await getStoredTodos()
} catch {
  console.error('Failed to load todos')
  todoErrorMessage.textContent =
    'Failed to load todos from the server. Please try again later.'
} finally {
  hideLoadingSpinner()
}

function renderTodos() {
  todoList.innerHTML = ''
  if (todos.length === 0) {
    todoList.style.display = 'none'
  } else {
    todoList.style.display = 'flex'
  }
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
    try {
      const checkboxDone = await apiUpdateTodo(el.id, {
        done: checkbox.checked,
      })
      if (checkboxDone) {
        el.done = checkbox.checked
        updateOverdueTask()
      } else {
        checkbox.checked = !checkbox.checked
      }
    } finally {
      hideLoadingSpinner()
    }
  })
  removeButton.addEventListener('click', async () => {
    showLoadingSpinner()
    try {
      const removeCheck = await apiDeleteTodo(el.id)
      if (removeCheck) {
        removeElement(todos, el.id)
        renderTodos()
      }
    } catch {
      todoErrorMessage.textContent = 'Failed to delete todo from the server'
      renderTodos()
    } finally {
      hideLoadingSpinner()
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
  if (isTodoPending) return
  isTodoPending = true
  addTodoButton.disabled = true
  todoInput.disabled = true
  dateInput.disabled = true

  try {
    todoErrorMessage.textContent = ''
    todoInput.classList.remove('input--error')
    dateInput.classList.remove('input--error')

    const inputValue = todoInput.value.trim()
    const dueDateValue = dateInput.value

    if (inputValue === '') {
      todoInput.classList.add('input--error')
      if (dueDateValue && dueDateValue < getCurrentDate()) {
        dateInput.classList.add('input--error')
        todoErrorMessage.textContent = 'The input and date are not valid'
      } else {
        todoErrorMessage.textContent = 'The input should not be empty !'
      }
      todoInput.blur()
      return
    }

    if (dueDateValue && dueDateValue < getCurrentDate()) {
      dateInput.classList.add('input--error')
      todoErrorMessage.textContent = 'Due date cannot be in the past !'
      return
    }

    showLoadingSpinner()
    const createdTodo = await apiAddTodo({
      title: inputValue,
      content: '',
      done: false,
      due_date: dueDateValue || null,
    })

    if (createdTodo) {
      todos.push(createdTodo)
      renderTodos()
      todoInput.value = ''
      dateInput.value = ''
    } else {
      todoErrorMessage.textContent = 'Failed to save new todo to the server.'
    }
  } catch (error) {
    console.error('Failed to add task', error)
  } finally {
    isTodoPending = false
    addTodoButton.disabled = false
    todoInput.disabled = false
    dateInput.disabled = false
    hideLoadingSpinner()
  }
}

function removeElement(element: Todo[] | Category[], id: number) {
  const index = element.findIndex((el: Todo | Category) => el.id === id)
  if (index === -1) return
  element.splice(index, 1)
}

async function clearElements() {
  if (todos.length === 0 && categories.length === 0) return
  showLoadingSpinner()
  try {
    const clearTodosCheck = await apiClearTodo()
    const clearCategoriesCheck = await clearCategories()

    if (clearTodosCheck) {
      todos.splice(0, todos.length)
      renderTodos()
    }

    if (clearCategoriesCheck) {
      categories.splice(0, categories.length)
      resetEditedCategory()
      renderCategories()
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

todoInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    addNewElement()
  }
})

addTodoButton.addEventListener('click', addNewElement)
categoryInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
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
deleteAllButton.addEventListener('click', () => {
  clearElements()
})
