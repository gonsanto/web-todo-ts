export function showLoadingSpinner() {
  let overlay = document.querySelector<HTMLElement>('.loading-overlay')

  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = 'loading-overlay'

    const spinner = document.createElement('div')
    spinner.className = 'spinner'

    overlay.appendChild(spinner)
    document.body.appendChild(overlay)
  }
  overlay.style.display = 'flex'
}

export function hideLoadingSpinner() {
  const overlay = document.querySelector<HTMLElement>('.loading-overlay')
  if (overlay) {
    overlay.style.display = 'none'
  }
}
