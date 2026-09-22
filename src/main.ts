import './style.css'
import {
  addApiCategories,
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

let isEditing = false
let editedCategoryId: number
const addCategory = (el: Category) => {
  const category = document.createElement('li')
  Object.assign(category, {
    id: `categories-elements-${el.id}`,
    style: `background: ${el.color};`,
  })

  const textSpan = document.createElement('span')
  textSpan.textContent = el.title

  const editButton = document.createElement('button')
  editButton.textContent = 'edit'
  editButton.style.cursor = 'pointer'

  const removeButton = document.createElement('button')
  removeButton.textContent = '🗑'
  removeButton.style.cursor = 'pointer'

  editButton.addEventListener('click', () => {
    editedCategoryId = el.id
    categoryInput.value = el.title
    colorInput.value = el.color
    addCategoryButton.textContent = 'save'
    addCategoryButton.id = 'edit-category-button'
    isEditing = true
    categoryInput.focus()
  })

  removeButton.addEventListener('click', async () => {
    showLoadingSpinner()
    const removeCheck = await deleteApiCategories(el.id)
    hideLoadingSpinner()
    if (removeCheck) {
      removeElement(categories, el.id)
      renderCategories()
    } else {
      categoryErrorMessage.textContent =
        'Failed to delete category from the server'
    }
  })

  category.appendChild(textSpan)
  category.appendChild(editButton)
  category.appendChild(removeButton)
  categoryList.appendChild(category)
}

const addNewCategory = async () => {
  if (isAdding) return

  categoryErrorMessage.textContent = ''
  categoryInput.classList.remove('category--error')

  const categoryValue = categoryInput.value
  const colorValue = colorInput.value

  if (categoryValue.trim() === '') {
    categoryInput.classList.add('input--error')
    categoryErrorMessage.textContent = 'The input should not be empty !'
    categoryInput.blur()
    return
  }

  const newCategory = {
    title: categoryValue,
    color: colorValue,
  }
  try {
    isAdding = true
    showLoadingSpinner()
    const createdCategory = await addApiCategories(newCategory)

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
    console.error('Failes to add category', error)
  } finally {
    isAdding = false
    hideLoadingSpinner()
  }
}

async function editCategory() {
  if (editedCategoryId === undefined) return

  categoryErrorMessage.textContent = ''
  categoryInput.classList.remove('input--error')

  const categoryValue = categoryInput.value.trim()
  const colorValue = colorInput.value

  if (categoryValue === '') {
    categoryInput.classList.add('input--error')
    categoryErrorMessage.textContent = 'The input should not be empty !'
    return
  }

  try {
    showLoadingSpinner()
    // This returns true or false based on your API implementation
    const isSuccess = await updateApiCategories(editedCategoryId, {
      title: categoryValue,
      color: colorValue,
    })

    if (isSuccess) {
      // Find the category locally and update its properties directly
      const index = categories.findIndex((c) => c.id === editedCategoryId)
      if (index !== -1) {
        categories[index].title = categoryValue
        categories[index].color = colorValue
      }

      renderCategories()

      // Reset form and states back to "Add" mode
      categoryInput.value = ''
      colorInput.value = '#f9f9f9'
      addCategoryButton.textContent = 'Add'
      addCategoryButton.id = 'add-category-button'
      isEditing = false
      editedCategoryId = 0
    } else {
      categoryErrorMessage.textContent =
        'Failed to update category on the server.'
    }
  } catch (error) {
    console.error('Failed to edit category:', error)
  } finally {
    hideLoadingSpinner()
  }
}

let todos: Todo[] = []
try {
  showLoadingSpinner()
  todos = await getStoredTodos()
  renderTodos()
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
  renderCategories()
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
      removeElement(todos, el.id)
      renderTodos()
    } else {
      todoErrorMessage.textContent = 'Failed to delete todo from the server'
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

  todoErrorMessage.textContent = ''
  todoInput.classList.remove('input--error')
  dateInput.classList.remove('input--error')

  const inputValue = todoInput.value
  const dueDateValue = dateInput.value

  if (inputValue.trim() === '') {
    todoInput.classList.add('input--error')
    dateInput.classList.add('input--error')
    todoErrorMessage.textContent = 'The input should not be empty !'
    todoInput.blur()
    return
  }

  if (dueDateValue && dueDateValue < getCurrentDate()) {
    dateInput.classList.add('input--error')
    todoInput.classList.add('input--error')
    todoErrorMessage.textContent = 'Due date cannot be in the past !'
    return
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
      todoInput.value = ''
      dateInput.value = ''
    } else {
      todoErrorMessage.textContent = 'Failed to save new todo to the server.'
    }
  } catch (error) {
    console.error('Failes to add task', error)
  } finally {
    isAdding = false
    hideLoadingSpinner()
  }
}

function removeElement(element: Todo[] | Category[], id: number) {
  const index = element.findIndex((el: Todo | Category) => el.id === id)
  if (index === -1) return
  element.splice(index, 1)
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

todoInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    addNewElement()
  }
})

addTodoButton.addEventListener('click', addNewElement)
addCategoryButton.addEventListener('click', () => {
  if (isEditing) {
    editCategory()
  } else {
    addNewCategory()
  }
})
deleteAllButton.addEventListener('click', () => {
  clearElements()
})
