# Go Tutorials (uByte)

An interactive Go learning platform built with Next.js. Learn Go through concise tutorials with a live code playground, progress tracking, XP system, and achievements. **Multi-language ready** — structure supports adding Python, C++, and more.

## Features

- 19+ Go tutorials from beginner to advanced
- Interactive code playground (runs real Go code via go.dev)
- Progress tracking with XP and streaks
- Badges and achievements
- Bookmarks & code snapshots
- Dark/light/system theme
- Freemium signup wall (5 free page views)
- **Modular architecture** for adding Python, C++ and other languages

## Tutorials

1. Getting Started
2. Variables & Data Types
3. fmt Package
4. Control Flow
5. Loops
6. Arrays & Slices
7. Maps
8. Functions
9. Pointers
10. Structs
11. Methods
12. Interfaces
13. Error Handling
14. Packages & Modules
15. Concurrency

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Content**: MDX with gray-matter (`content/go/` per language)
- **Database**: Neon PostgreSQL
- **Auth**: JWT with HttpOnly cookies, Google OAuth, CSRF protection
- **Styling**: Tailwind CSS 4
- **Syntax highlighting**: Custom client-side Go highlighter

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Build

```bash
npm run build
npm start
```
