import './style.css'
import { elements } from './dom.ts'

const { input, button, todoList, errorMessage } = elements
let todoEl = 0;

function addNewElement() {
  errorMessage.textContent = ''
  input.classList.remove('input--error')

  const inputValue = input.value
  if (!(inputValue.trim() === '')) {
    const todoElements = document.createElement('li')

    todoEl++;
    todoElements.id = `todo-elements-${todoEl}`

    todoElements.textContent = inputValue
    todoList.appendChild(todoElements)
    input.value = ''
  } else {
    input.classList.add('input--error')
    errorMessage.textContent = 'The input should not be empty !'
    input.blur()
    input.value = ''
  }
}

input.addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Enter') { addNewElement() } })
button.addEventListener('click', addNewElement)