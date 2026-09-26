import type { Category } from './types'

const url = 'https://api.todos.in.jt-lab.ch/'
const jsonApplication = 'application/json'

export async function getApiCategories(): Promise<Category[]> {
  const response = await fetch(`${url}categories`, {
    headers: { Accept: jsonApplication },
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data: unknown = await response.json()
  return Array.isArray(data) ? data : []
}

// Omit<Category, 'id'> is present to omit the id in the Category type since the API already gives out an id
export async function addApiCategories(
  newTodo: Omit<Category, 'id'>,
): Promise<Category | null> {
  try {
    const response = await fetch(`${url}categories`, {
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
    console.error('Category add error:', error)
    return null
  }
}

export async function updateApiCategories(
  id: number,
  update: Partial<Category>,
): Promise<boolean> {
  try {
    const response = await fetch(`${url}categories?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': jsonApplication },
      body: JSON.stringify(update),
    })
    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('Category Update error', error)
    return false
  }
}

export async function deleteApiCategories(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${url}categories?id=eq.${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('Category Delete error:', error)
    return false
  }
}

export async function clearCategories(): Promise<boolean> {
  try {
    const response = await fetch(`${url}categories`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`Failed to clear category: ${response.status}`)
    }
    return true
  } catch (error) {
    console.error('API Delete error:', error)
    return false
  }
}
