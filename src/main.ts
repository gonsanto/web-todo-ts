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
  clearApiCategoriesTodos,
  getApiCategoriesTodos,
} from './categoriesTodoApi.ts'
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
colorInput.value = '#f9f9f9'

let categoriesLoaded = false
const renderCategories = () => {
  categoryList.innerHTML = ''
  categories.forEach((Category) => {
    addCategory(Category)
  })

  const empty = categories.length === 0
  categoryList.classList.toggle('hidden', empty)
  deleteAllCategoriesButton.classList.toggle(
    'hidden',
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
  category.style.borderColor = el.color

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
      } else {
        categoryErrorMessage.textContent =
          'Failed to delete category from the server'
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
      renderTodos()
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

let categoriesTodosLoaded = false
let categoriesTodos: Category_Todo[] = []
try {
  showLoadingSpinner()
  categoriesTodos = await getApiCategoriesTodos()
  categoriesTodosLoaded = true
} catch {
  todoErrorMessage.textContent =
    'Failed to load categories todos from the server. Please try again later.'
} finally {
  hideLoadingSpinner()
}

function renderCategoryOptions() {
  const previous = todoCategoryInput.value

  todoCategoryInput.innerHTML =
    '<option value="">--Assign a Category--</option>'
  categories.forEach((category) => {
    const option = document.createElement('option')
    option.value = `${category.id}`
    option.textContent = category.title
    option.style.backgroundColor = category.color
    todoCategoryInput.appendChild(option)
  })

  const stillValid =
    previous && categories.some((c) => String(c.id) === previous)
  todoCategoryInput.value = stillValid ? previous : ''

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
    todoErrorMessage.textContent =
      'Failed to load todos and categories todos from the server. Please try again later.'
  } else {
    todoErrorMessage.textContent =
      'Failed to load todos from the server. Please try again later.'
  }
} finally {
  hideLoadingSpinner()
}

function renderTodos() {
  todoList.innerHTML = ''
  todos.forEach((Todo) => {
    addTask(Todo)
  })
  updateOverdueTask()

  const empty = todos.length === 0
  todoList.classList.toggle('hidden', empty)
  deleteAllTodosButton.classList.toggle('hidden', empty || !todosLoaded)
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
        todoErrorMessage.textContent = 'Failed to update todo from the server'
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
        todoErrorMessage.textContent = 'Failed to delete todo from the server'
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
    noDueDate.textContent = 'no due date'
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

    categoryEl.classList.add('category-todos')
    categoryEl.textContent = category.title
    if (categoryColor === '#f9f9f9') {
      categoryEl.style.borderColor = '#ddd'
      categoryEl.style.background = '#ddd'
      todoElements.style.borderColor = '#ddd'
    } else {
      categoryEl.style.borderColor = categoryColor
      categoryEl.style.background = categoryColor
      todoElements.style.borderColor = categoryColor
    }
  } else {
    categoryEl.textContent = 'no category'
    categoryEl.classList.add('no-category')
  }

  return categoryEl
}

function updateOverdueTask() {
  const hasOverdueTasks = todos.some(
    (todo) =>
      !todo.done && getDueDateStatus(todo.due_date) === 'due-date--overdue',
  )
  overdueMessage.textContent = hasOverdueTasks
    ? 'Attention: You have overdue tasks that require your immediate attention!'
    : ''
  overdueMessage.classList.toggle('hidden', !hasOverdueTasks)
}

function applyCategoryInputColor() {
  const selectedId = todoCategoryInput.value

  if (selectedId === '') {
    todoCategoryInput.style.backgroundColor = ''
    todoCategoryInput.style.color = ''
    return
  }
  const category = categories.find(
    (category) => category.id === Number(selectedId),
  )
  if (!category) return

  if (category.color === '#f9f9f9') {
    todoCategoryInput.style.backgroundColor = ''
    todoCategoryInput.style.color = 'black'
  } else {
    todoCategoryInput.style.backgroundColor = category.color
    todoCategoryInput.style.color = 'white'
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
    todoErrorMessage.textContent = ''
    todoInput.classList.remove('input--error')
    dateInput.classList.remove('input--error')

    const inputValue = todoInput.value.trim()
    const dueDateValue = dateInput.value
    const categoryIdValue = todoCategoryInput.value

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
      if (categoryIdValue) {
        const assignedCategory = await addApiCategoriesTodos({
          category_id: Number(categoryIdValue),
          todo_id: createdTodo.id,
        })
        if (assignedCategory) {
          categoriesTodos.push(assignedCategory)
        } else {
          todoErrorMessage.textContent =
            'Todo created, but failed to assign the category'
        }
      }
      todos.push(createdTodo)
      renderTodos()
      todoCategoryInput.value = ''
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
  if (list === 'todos') {
    if (!todosLoaded) {
      todoErrorMessage.textContent =
        'Cannot clear todos: they were not loaded from the server.'
      return
    }
    if (!categoriesTodosLoaded) {
      todoErrorMessage.textContent =
        'Cannot clear todos: linked todos were not loaded from the server'
      return
    }
  }
  if (list === 'categories' && !categoriesLoaded) {
    categoryErrorMessage.textContent =
      'Cannot clear categories: they were not loaded from the server.'
    return
  }
  if (list === 'todos' && todos.length === 0) return
  if (list === 'categories' && categories.length === 0) return

  showLoadingSpinner()
  try {
    if (list === 'todos') {
      const clearTodosCheck = await apiClearTodo()
      const clearCategoryTodoCheck = await clearApiCategoriesTodos()

      if (clearTodosCheck) todos.splice(0, todos.length)
      if (clearCategoryTodoCheck)
        categoriesTodos.splice(0, categoriesTodos.length)

      if (!clearTodosCheck || !clearCategoryTodoCheck) {
        todoErrorMessage.textContent =
          'Failed to clear some todos from the server.'
      }
    }
    if (list === 'categories') {
      const clearCategoriesCheck = await clearCategories()
      if (clearCategoriesCheck) {
        categories.splice(0, categories.length)
        categoriesTodos.splice(0, categoriesTodos.length)
        resetEditedCategory()
        renderCategories()
      }
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

deleteAllTodosButton.addEventListener('click', () => {
  clearElements('todos')
})
deleteAllCategoriesButton.addEventListener('click', () => {
  clearElements('categories')
})
