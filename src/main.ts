import './style.css'

const input = document.querySelector<HTMLInputElement>('#todo-input')
const button = document.querySelector<HTMLButtonElement>('#add-todo-button')
const todoList = document.querySelector<HTMLUListElement>('#todo-list')
const errorMessage = document.querySelector<HTMLParagraphElement>('#todo-error')

if (!input || !button) {
  throw new Error('One of the input values are null')
}

function check() {
  if (!input || !todoList || !errorMessage) {
    throw new Error('One of the input values are null')
  }
  errorMessage.textContent = ''
  input.classList.remove('input--error')

  const inputValue = input.value

  if (inputValue.trim() === '') {
    input.classList.add('input--error')
    errorMessage.textContent = 'The input should not be empty !'
    input.blur()
  } else {
    const todoElements = document.createElement('li')
    todoElements.id = 'todo-elements'

    todoElements.textContent = inputValue
    todoList.appendChild(todoElements)
    input.value = ''
  }
}

input.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    check()
  }
})
button.addEventListener('click', check)