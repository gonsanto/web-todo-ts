function checkNull<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`The ${element} value is not valid/null`)
  }
  return element
}

export const elements = {
  main: checkNull<HTMLElement>('main'),
  todoInput: checkNull<HTMLInputElement>('#todo-input'),
  addTodoButton: checkNull<HTMLButtonElement>('#add-todo-button'),
  todoList: checkNull<HTMLUListElement>('#todo-list'),
  todoErrorMessage: checkNull<HTMLParagraphElement>('#todo-error'),
  dateInput: checkNull<HTMLInputElement>('#todo-date-input'),
  overdueMessage: checkNull<HTMLParagraphElement>('#overdue-message'),
  categoryInput: checkNull<HTMLInputElement>('#category-name-input'),
  addCategoryButton: checkNull<HTMLButtonElement>('#add-category-button'),
  categoryList: checkNull<HTMLUListElement>('#category-list'),
  colorInput: checkNull<HTMLInputElement>('#category-color-input'),
  categoryErrorMessage: checkNull<HTMLParagraphElement>('#category-error'),
  deleteAllTodosButton: checkNull<HTMLButtonElement>('#delete-all-todos'),
  deleteAllCategoriesButton: checkNull<HTMLButtonElement>(
    '#delete-all-categories',
  ),
}
