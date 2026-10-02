import type { Category_Todo } from './types'

const url = 'https://api.todos.in.jt-lab.ch/'
const jsonApplication = 'application/json'

export async function getApiCategoriesTodos(): Promise<Category_Todo[]> {
  const response = await fetch(`${url}categories_todos`, {
    headers: { Accept: jsonApplication },
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data: unknown = await response.json()
  return Array.isArray(data) ? data : []
}

export async function addApiCategoriesTodos(
  newCategoryTodo: Category_Todo,
): Promise<Category_Todo | null> {
  try {
    const response = await fetch(`${url}categories_todos`, {
      method: 'POST',
      headers: {
        'Content-Type': jsonApplication,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(newCategoryTodo),
    })
    if (!response.ok) {
      throw new Error(`Failed to add category-todo: ${response.status}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data[0] : data
  } catch (error) {
    console.error('Category-todo add error:', error)
    return null
  }
}
