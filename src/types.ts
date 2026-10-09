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

export interface Category_Todo {
  category_id: number
  todo_id: number
}

export interface PendingDelete {
  type: 'single' | 'all'
  todos: Todo[]
  assignedTodo: Category_Todo[]
  timerId: number
}
