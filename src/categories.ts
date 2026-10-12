import {
  clearApiCategories,
  deleteApiCategories,
  updateApiCategories,
} from './api/categoryApi'
import { renderCategories, renderTodos } from './render'
import { state } from './state'
import { hideLoadingSpinner, showLoadingSpinner } from './ui/updateUi'
import { constants } from './utils/constants'
import { elements } from './utils/dom'
import { removeElement } from './utils/removeElement'
import type { Category } from './utils/types'

const {
  emptyValue,
  baseColorInputValue,
  addButtonText,
  editButtonText,
  removeButtonText,
  isEditingClass,
  saveButtonText,
  inputErrorClass,
  failedTo,
  invalid,
  canNotClear,
} = constants
const {
  colorInput,
  categoryList,
  categoryInput,
  addCategoryButton,
  categoryErrorMessage,
} = elements

export const addCategory = (category: Category) => {
  const categoryElement = document.createElement('li')
  categoryElement.id = `categories-elements-${category.id}`
  categoryElement.style.backgroundColor = category.color
  categoryElement.style.borderColor =
    category.color === baseColorInputValue ? emptyValue : category.color

  const textSpan = document.createElement('span')
  textSpan.textContent = category.title

  const editButton = document.createElement('button')
  editButton.textContent = editButtonText

  const removeButton = document.createElement('button')
  removeButton.textContent = removeButtonText

  editButton.addEventListener('click', () => {
    categoryList.querySelectorAll('li').forEach((li) => {
      li.classList.remove(isEditingClass)
    })
    categoryElement.classList.add(isEditingClass)

    state.editedCategoryId = category.id
    categoryInput.value = category.title
    colorInput.value = category.color
    addCategoryButton.textContent = saveButtonText
    state.isEditingCategory = true
    categoryInput.focus()
  })

  removeButton.addEventListener('click', async () => {
    showLoadingSpinner()

    try {
      const removeCheck = await deleteApiCategories(category.id)
      if (removeCheck) {
        removeElement(state.categories, category.id)
        if (state.editedCategoryId === category.id) resetEditedCategory()
        renderCategories()
        renderTodos()
      } else {
        categoryErrorMessage.textContent = failedTo.delete.category
      }
    } finally {
      hideLoadingSpinner()
    }
  })

  categoryElement.appendChild(textSpan)
  categoryElement.appendChild(editButton)
  categoryElement.appendChild(removeButton)
  categoryList.appendChild(categoryElement)
}

export const editCategory = async () => {
  if (state.isCategoryPending) return
  if (state.editedCategoryId === null) return
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
    const isSuccess = await updateApiCategories(state.editedCategoryId, {
      title: categoryValue,
      color: colorValue,
    })

    if (isSuccess) {
      const index = state.categories.findIndex(
        (c) => c.id === state.editedCategoryId,
      )
      if (index !== -1) {
        state.categories[index].title = categoryValue
        state.categories[index].color = colorValue
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
    state.isCategoryPending = false
    addCategoryButton.disabled = false
    categoryInput.disabled = false
    colorInput.disabled = false
    hideLoadingSpinner()
  }
}

export const clearCategories = async () => {
  if (!state.categoriesLoaded) {
    categoryErrorMessage.textContent = canNotClear.categories
    return
  }
  if (state.categories.length === 0) return

  showLoadingSpinner()
  try {
    const clearCategoriesCheck = await clearApiCategories()
    if (clearCategoriesCheck) {
      state.categories.splice(0, state.categories.length)
      state.categoriesTodos.splice(0, state.categoriesTodos.length)
      resetEditedCategory()
    } else {
      categoryErrorMessage.textContent = failedTo.clear.category
    }
    renderCategories()
    renderTodos()
  } finally {
    hideLoadingSpinner()
  }
}

export const resetEditedCategory = () => {
  categoryInput.value = emptyValue
  colorInput.value = baseColorInputValue
  addCategoryButton.textContent = addButtonText
  state.isEditingCategory = false
  state.editedCategoryId = null
}
