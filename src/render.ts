import { addCategory } from './categories'
import { state } from './state'
import { addTask } from './todos'
import { renderCategoryOptions, updateOverdueTask } from './ui/updateUi'

import { constants } from './utils/constants'
import { elements } from './utils/dom'

const { emptyValue, isHiddenClass } = constants
const {
  todoList,
  categoryList,
  deleteAllTodosButton,
  deleteAllCategoriesButton,
} = elements

export const renderTodos = () => {
  todoList.innerHTML = emptyValue
  state.todos.forEach((Todo) => {
    addTask(Todo)
  })
  updateOverdueTask()

  const empty = state.todos.length === 0
  todoList.classList.toggle(isHiddenClass, empty)
  deleteAllTodosButton.classList.toggle(
    isHiddenClass,
    !state.todosLoaded || state.todos.length <= 1,
  ) // Hide "Delete All when there is less than 1 todo"
}
export const renderCategories = () => {
  categoryList.innerHTML = emptyValue
  state.categories.forEach((Category) => {
    addCategory(Category)
  })

  const empty = state.categories.length === 0
  categoryList.classList.toggle(isHiddenClass, empty)
  deleteAllCategoriesButton.classList.toggle(
    isHiddenClass,
    !state.categoriesLoaded || state.categories.length <= 1,
  ) // Hide "Delete All when there is less than 1 todo"
  renderCategoryOptions()
}
