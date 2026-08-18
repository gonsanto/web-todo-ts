/*
export function assertFunction(value: unknown, message: string): asserts value {
  if (value === null || value === undefined) {
    throw new Error(message)
  }
}
*/

export const input = document.querySelector<HTMLInputElement>('#todo-input')

export const button =
  document.querySelector<HTMLButtonElement>('#add-todo-button')

export const todoList = document.querySelector<HTMLUListElement>('#todo-list')

export const errorMessage =
  document.querySelector<HTMLParagraphElement>('#todo-error')
