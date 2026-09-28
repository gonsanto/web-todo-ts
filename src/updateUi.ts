let spinnerCount = 0

export function showLoadingSpinner() {
  spinnerCount++
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
  spinnerCount = Math.max(0, spinnerCount - 1)
  if (spinnerCount > 0) return
  const overlay = document.querySelector<HTMLElement>('.loading-overlay')
  if (overlay) {
    overlay.style.display = 'none'
  }
}
