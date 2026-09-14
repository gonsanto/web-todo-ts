import type { Todo } from './types.ts'

const url = 'https://api.todos.in.jt-lab.ch/'
const jsonApplication = 'application/json'

export async function getStoredTodos(): Promise<Todo[]> {
  try {
    const response = await fetch(`${url}todos`, {
      headers: { Accept: jsonApplication },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: unknown = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch todos from API:', error)
    return []
  }
}

export async function apiAddTodo(
  newTodo: Omit<Todo, 'id'>,
): Promise<Todo | null> {
  try {
    const response = await fetch(`${url}todos`, {
      method: 'POST',
      headers: {
        'Content-Type': jsonApplication,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(newTodo),
    })
    if (!response.ok) {
      throw new Error(`Failed to add todo: ${response.status}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data[0] : data
  } catch (error) {
    console.error('API add error:', error)
    return null
  }
}

export async function apiUpdateTodo(
  id: number,
  update: Partial<Todo>,
): Promise<boolean> {
  try {
    const response = await fetch(`${url}todos?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': jsonApplication },
      body: JSON.stringify(update),
    })
    if (!response.ok) {
      throw new Error(`Failed to update todo: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('API Update error', error)
    return false
  }
}

export async function apiDeleteTodo(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${url}todos?id=eq.${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete todo: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('API Delete error:', error)
    return false
  }
}

export async function apiClearTodo(): Promise<boolean> {
  try {
    const response = await fetch(`${url}todos`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`Failed to clear todo: ${response.status}`)
    }
    return true
  } catch (error) {
    console.error('API Delete error:', error)
    return false
  }
}
