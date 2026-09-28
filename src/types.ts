export interface Todo {
  id: number
  title: string
  content?: string
  done: boolean
  due_date: string | null
}

export interface Category {
  id: number
  title: string
  color: string
}

export interface CategoryUpdate {
  id: number
  title?: string
  color?: string
}
