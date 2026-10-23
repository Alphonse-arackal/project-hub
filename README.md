# Alphonse Arackal — Project Hub

A responsive React + Vite dashboard for storing, opening, and sharing project links.

## Features

- Dark monochrome design (black, white, grey)
- Responsive two-column project grid
- Open GitHub repository and live site in separate tabs
- Per-project dropdown: Copy GitHub URL, Copy Live URL, Copy both links
- Copy all project links
- Search by project name, description, or technology
- Add, edit, and delete projects
- LocalStorage persistence
- Project icon and technology tags
- URL validation, copy notifications, keyboard escape and click-outside dropdown handling

## Run locally

Requirements: Node.js 18+ recommended.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Build for deployment

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Add your real project URLs

Open `src/data/initialProjects.js` and replace the empty `githubUrl` and `liveUrl` values with the URLs for your projects. You can also add and edit projects in the UI.

The StudyFlow live URL is prefilled from the supplied project details. Other project URLs are intentionally left blank rather than guessed.

## Persistence note

Projects are saved in the current browser's LocalStorage. They are not synchronised across devices or browsers. Clearing browser site data will remove locally saved changes, so keep a backup of important URLs.

## Deployment

This is a client-side React app and can be deployed to Netlify, Vercel, or another static hosting provider. For GitHub Pages, configure Vite's `base` option to match your repository path if publishing under a project subpath.

## Clipboard behaviour

Clipboard copy uses the browser Clipboard API when available and a textarea fallback otherwise. Clipboard APIs generally work on HTTPS or localhost.


## Recent UI update

- Updated the accent palette to yellow with black, white, and grey surfaces to match the supplied reference.
- Fixed project action dropdown stacking by raising the card containing an open menu above neighbouring cards.
