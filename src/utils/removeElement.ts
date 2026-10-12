import type { Category, Todo } from './types'

export const removeElement = (element: Todo[] | Category[], id: number) => {
  const index = element.findIndex((el: Todo | Category) => el.id === id)
  if (index === -1) return
  element.splice(index, 1)
}
