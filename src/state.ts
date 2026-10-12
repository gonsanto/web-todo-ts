import type {
  Category,
  Category_Todo,
  PendingDelete,
  Todo,
} from './utils/types'

export const state = {
  todos: [] as Todo[],
  categories: [] as Category[],
  categoriesTodos: [] as Category_Todo[],
  pendingDeletes: [] as PendingDelete[],

  todosLoaded: false,
  categoriesLoaded: false,
  categoriesTodosLoaded: false,

  isTodoPending: false,
  isCategoryPending: false,
  isEditingCategory: false,

  editedCategoryId: null as number | null,
}
