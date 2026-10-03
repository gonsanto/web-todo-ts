export const constants = {
  emptyValue: '',
  baseCategoryColor: '#ddd',
  baseColorInputValue: '#f9f9f9',
  baseCategoryTodoBackgroundColor: '',

  addButtonText: 'add',
  editButtonText: 'edit',
  saveButtonText: 'save',
  removeButtonText: '🗑',
  categoryTodoInputText: '--Assign a Category--',

  noDueDateText: 'no due date',
  categoryElText: 'no category',

  noAssignedCategoryClass: 'no-category',
  hasAssignedCategoryClass: 'category-todos',
  overdueTaskClass: 'due-date--overdue',
  isHiddenClass: 'hidden',
  isEditingClass: 'editing',

  inputErrorClass: 'input--error',
  overdueMessageText: 'Attention: You have overdue tasks that are undone !',
  invalid: {
    textInput: 'The input should not be empty !',
    dateInput: 'Due date cannot be in the past !',
    inputs: 'The input and date are not valid !',
  },
  failedTo: {
    add: {
      category: 'Failed to add category to the server.',
      todo: 'Failed to add todo to the server.',
      categoryTodo: 'Failed to add category assigned todo to the server.',
    },
    load: {
      category:
        'Failed to load categories from the server. Please try again later.',
      anyTodo:
        'Failed to load todos and category assigned todos from the server. Please try again later.',
      todo: 'Failed to load todos from the server. Please try again later.',
      categoryTodo:
        'Failed to load category assigned todos from the server. Please try again later.',
    },
    update: {
      category: 'Failed to update category from the server.',
      todo: 'Failed to update todo from the server.',
      categoryTodo: 'Failed to update category assigned todo from the server.',
    },
    save: {
      category: 'Failed to save new category to the server.',
      todo: 'Failed to save new todo to the server.',
    },
    delete: {
      category: 'Failed to delete category from the server.',
      todo: 'Failed to delete todo from the server.',
      categoryTodo: 'Failed to delete category assigned todo from the server.',
    },
    clear: {
      category: 'Failed to clear categories from the server.',
      todo: 'Failed to clear todos from the server.',
    },
    error: {
      assignCategory: 'Todo created, but failed to assign the category',
      addCategory: 'Failed to add category:',
      editCategory: 'Failed to edit category:',
      addTodo: 'Failed to add todo:',
    },
  },
  canNotClear: {
    todos: 'Cannot clear todos: they were not loaded from the server.',
    categoryTodos:
      'Cannot clear todos: Category assigned todos were not loaded from the server.',
    categories:
      'Cannot clear categories: they were not loaded from the server.',
  },
  keyboardKey: {
    enter: 'Enter',
    escape: 'Escape',
  },
} as const
