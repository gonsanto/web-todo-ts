import type { Todo } from './types.ts'

let isStorageSafe = true

export function getStoredTodos(): Todo[] {
  try {
    const rawData = localStorage.getItem('todos') ?? '[]'
    const parsedData: unknown = JSON.parse(rawData)

    return Array.isArray(parsedData)
      ? parsedData.filter(
          (todo): todo is Todo =>
            typeof todo === 'object' &&
            todo !== null &&
            typeof todo.id === 'number' &&
            typeof todo.text === 'string' &&
            typeof todo.isDone === 'boolean' &&
            typeof todo.dueDate === 'string',
        )
      : []
  } catch {
    isStorageSafe = false
    return []
  }
}
export function isSaveTodo(todos: Todo[]): boolean {
  if (!isStorageSafe) {
    console.warn(
      'Storage read failed. To prevent data loss writing is disabled',
    )
    return false
  }
  try {
    localStorage.setItem('todos', JSON.stringify(todos))
    return true
  } catch {
    console.warn('Storage data exceeded or unavailable')
    return false
  }
}
