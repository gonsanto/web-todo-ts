import { constants } from './constants'
import type { Todo } from './types'

const { noDueDateText } = constants

export const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-CA')
}

export const getDueDateStatus = (el: string | null) => {
  if (!el) {
    return 'no-due-date'
  }

  const dateNow = getCurrentDate()
  let dueDate: string

  if (el === dateNow) {
    dueDate = 'today'
  } else if (el < dateNow) {
    dueDate = 'overdue'
  } else {
    const dueDateObj = new Date(el)
    const todayObj = new Date(dateNow)
    const milisecondsToDay = 1000 * 60 * 60 * 24

    const diffTime = dueDateObj.getTime() - todayObj.getTime()
    const diffDays = Math.round(diffTime / milisecondsToDay)

    if (diffDays >= 1 && diffDays <= 4) {
      dueDate = 'soon'
    } else {
      dueDate = 'later'
    }
  }
  return `due-date--${dueDate}`
}

export const createDateElement = (el: Todo) => {
  if (!el.due_date) {
    const noDueDate = document.createElement('p')
    noDueDate.textContent = noDueDateText
    return noDueDate
  }

  const timeEl = document.createElement('time')
  timeEl.textContent = el.due_date

  return timeEl
}
