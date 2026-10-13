# Web todo list

This project is a to-do list app, coded in [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html), that sends and receives tasks and categories from a [REST API](https://api.todos.in.jt-lab.ch/).

## Features

- Create, edit, and delete tasks
- Set an optional due date. Tasks are color-coded by urgency (today, soon, overdue, later)
- Create, edit, and delete categories with a custom color
- Assign one category per task when creating a new task
- Delete a task or all tasks with a 4-second undo window
- Delete all tasks or all categories in one action
- Warn before closing the tab if a delete is pending

## Code organization

- `/api` — connection between the REST API and the app.

- `/ui` — low-impact UI rendres, mainly updates.

- `/utils` — reusable helpers and constants used across the app.


## Setup

Requires [Node.js](https://nodejs.org/) (see `engines` in package.json) and [pnpm](https://pnpm.io/).

```
1. Install dependencies: `pnpm install`
2. Start the dev server: `pnpm dev`
3. Open [localhost:5173](http://localhost:5173/)
```

## Before committing

```
- Use `pnpm check-types` to launch the type checker. This will verify the project's type correctness.
- Use `pnpm format` to format all project files correctly.
- Use `pnpm lint` to run the Biome linter
```
These commands allow you to create good quality commits. Don't forget to lint and format before your commits.