function checkNull<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error('')
  }
  return element
}

export const elements = {
  input: checkNull<HTMLInputElement>('#todo-input'),
  button: checkNull<HTMLButtonElement>('#add-todo-button'),
  todoList: checkNull<HTMLUListElement>('#todo-list'),
  errorMessage: checkNull<HTMLParagraphElement>('#todo-error'),
}
