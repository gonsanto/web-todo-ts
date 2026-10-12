import { apiClearTodo, apiDeleteTodo } from '../api/todoApi'
import { renderTodos } from '../render'
import { state } from '../state'
import { constants } from '../utils/constants'
import { elements } from '../utils/dom'
import type { PendingDelete, Todo } from '../utils/types'
import { hideLoadingSpinner, showLoadingSpinner } from './updateUi'

const {
  isHiddenToastClass,
  emptyValue,
  whitespace,
  toastMessageText,
  isHiddenClass,
  toastDeleteTimer,
  dismissToastButtonText,
  hideUndoToastAnimation,
  noAnimation,
  toastButtonText,
  allTodos,
  singleTodo,
  failedTo,
} = constants
const {
  toast,
  toastMessage,
  toastButton,
  dismissToastButton,
  toastProgress,
  todoErrorMessage,
} = elements

dismissToastButton.textContent = dismissToastButtonText
toastButton.textContent = toastButtonText

let hideUndoToastListener: ((e: AnimationEvent) => void) | null
let currentUndoHandler: (() => void) | null

export const scheduleDelete = async (
  todosToDelete: Todo[],
  toastLabel: string,
  categoryEl?: HTMLElement,
) => {
  const idsToDelete = todosToDelete.map((todo) => todo.id)
  const isBeingDeleted = (id: number) => idsToDelete.includes(id)

  const entry: PendingDelete = {
    type: todosToDelete.length > 1 ? allTodos : singleTodo,
    todos: todosToDelete,
    assignedTodo: state.categoriesTodos.filter((ct) =>
      isBeingDeleted(ct.todo_id),
    ),
    timerId: 0,
  }

  commitPendingTodos() // Fast-forward any previous pending delete

  state.todos = state.todos.filter((todo) => !isBeingDeleted(todo.id))
  state.categoriesTodos = state.categoriesTodos.filter(
    (ct) => !isBeingDeleted(ct.todo_id),
  )
  renderTodos()

  showUndoToast(toastLabel, () => undoDelete(entry), categoryEl)

  entry.timerId = window.setTimeout(async () => {
    state.pendingDeletes = state.pendingDeletes.filter((pD) => pD !== entry)
    hideUndoToast()
    await commitDelete(entry)
  }, toastDeleteTimer)

  state.pendingDeletes.push(entry)
}

export const commitDelete = async (entry: PendingDelete) => {
  showLoadingSpinner()
  try {
    if (entry.type === allTodos) {
      const ok = await apiClearTodo()
      if (!ok) {
        state.todos.push(...entry.todos)
        state.categoriesTodos.push(...entry.assignedTodo)
        todoErrorMessage.textContent = failedTo.clear.todo
      }
    } else {
      const todo = entry.todos[0]
      const ok = await apiDeleteTodo(todo.id)
      if (!ok) {
        state.todos.push(todo)
        state.categoriesTodos.push(...entry.assignedTodo)
        todoErrorMessage.textContent = failedTo.delete.todo
      }
    }
  } finally {
    hideLoadingSpinner()
    renderTodos()
  }
}

export const commitPendingTodos = () => {
  if (state.pendingDeletes.length === 0) return

  const toCommit = state.pendingDeletes
  state.pendingDeletes = []
  hideUndoToast()

  for (const pending of toCommit) {
    window.clearTimeout(pending.timerId)
    commitDelete(pending)
  }
}

export const undoDelete = (entry: PendingDelete) => {
  const index = state.pendingDeletes.indexOf(entry)
  if (index === -1) return // -1 means not found

  window.clearTimeout(entry.timerId)
  state.pendingDeletes.splice(index, 1)

  state.todos.push(...entry.todos)
  state.categoriesTodos.push(...entry.assignedTodo)

  hideUndoToast()
  renderTodos()
}

export const showUndoToast = (
  toastLabel: string,
  onUndo: () => void,
  categoryEl?: HTMLElement,
) => {
  if (hideUndoToastListener) {
    toast.removeEventListener('animationend', hideUndoToastListener)
    hideUndoToastListener = null
  }
  toast.classList.remove(isHiddenToastClass)
  toastMessage.textContent = emptyValue

  if (categoryEl) {
    toastMessage.append(categoryEl.cloneNode(true), whitespace)
  }
  toastMessage.append(toastLabel, toastMessageText)

  currentUndoHandler = onUndo
  toastButton.disabled = false
  dismissToastButton.disabled = false
  toast.classList.remove(isHiddenClass)

  toastProgress.style.animation = noAnimation
  toastProgress.offsetWidth
  toastProgress.style.animation = `toast-progress-countdown ${toastDeleteTimer}ms linear`
}

export const hideUndoToast = () => {
  currentUndoHandler = null
  toast.classList.add(isHiddenToastClass)

  if (hideUndoToastListener) {
    toast.removeEventListener('animationend', hideUndoToastListener)
    hideUndoToastListener = null
  }

  hideUndoToastListener = (event: AnimationEvent) => {
    if (event.animationName !== hideUndoToastAnimation) return
    if (!toast.classList.contains(isHiddenToastClass)) return
    if (hideUndoToastListener) {
      toast.removeEventListener('animationend', hideUndoToastListener)
      hideUndoToastListener = null
    }
    toast.classList.remove(isHiddenToastClass)
    toastButton.disabled = true
    dismissToastButton.disabled = true
    toast.classList.add(isHiddenClass)
  }
  toast.addEventListener('animationend', hideUndoToastListener)
}

toastButton.addEventListener('click', () => {
  if (currentUndoHandler) currentUndoHandler()
})

dismissToastButton.addEventListener('click', hideUndoToast)
