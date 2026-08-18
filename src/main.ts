import './style.css'

const input = document.querySelector('#todo-input') as HTMLInputElement
const button = document.querySelector('#add-todo-button') as HTMLButtonElement
const todoList = document.querySelector('#todo-list') as HTMLUListElement
const errorMessage = document.querySelector(
  '#todo-error',
) as HTMLParagraphElement

function addNewElement() {
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
    addNewElement()
  }
})
button.addEventListener('click', addNewElement)
