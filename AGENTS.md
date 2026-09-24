import pypandoc

agents_md = r"""# AGENTS.md — Hashnode Clone Frontend Instructions

## 1. Project Context

This repository is a Hashnode-style developer blogging platform.

The original PRD specifies a Pure MERN stack with React/Vite. However, the current implementation decision for this repository is:

- Backend: Node.js + Express.js + MongoDB + Mongoose
- Frontend: plain HTML + CSS + JavaScript
- No React
- No TypeScript
- No Astro
- No Tailwind CSS
- No SSR
- Frontend communicates with the existing Express REST API only
- Do not rewrite the working backend just to fit a frontend framework

The PRD remains the source of truth for product functionality. The frontend technology is intentionally changed from React to vanilla HTML/CSS/JS.

## 2. Important Rule for Codex

Before creating or changing files:

1. Inspect the existing `client/` and `server/` structure.
2. Read the PRD/project documentation in the repository.
3. Preserve the existing working backend API and route contracts.
4. Use the installed `web-design-guidelines` skill when making UI/UX decisions.
5. Do not introduce React, Vite, Astro, Tailwind, TypeScript, or another framework.
6. Do not create unnecessary dependencies.
7. Prefer small, reusable vanilla-JS modules.
8. Do not duplicate API logic across pages.
9. Do not change backend behavior unless a real API integration issue is discovered.
10. After each meaningful change, run/test the relevant page and fix errors before continuing.

## 3. Frontend Technology

Use only:

- HTML5
- CSS3
- Modern browser JavaScript (ES modules)
- Fetch API
- Browser Local Storage where appropriate
- Markdown rendering library only if required for the PRD functionality
- Syntax highlighting library only if required for fenced code blocks

Do not install:

- React
- React Router
- Vite
- Astro
- Tailwind
- TypeScript
- Redux
- Next.js
- Any frontend framework

The frontend should remain easy for a beginner to understand.

## 4. Current Frontend Structure

Use this structure as the working architecture:

```text
client/
├── index.html
├── pages/
│   ├── login.html
│   ├── register.html
│   ├── post.html
│   ├── dashboard.html
│   ├── editor.html
│   ├── profile.html
│   ├── settings.html
│   └── tags.html
├── css/
│   ├── style.css
│   ├── navbar.css
│   ├── auth.css
│   ├── feed.css
│   ├── editor.css
│   ├── dashboard.css
│   └── profile.css
├── js/
│   ├── api/
│   │   ├── authApi.js
│   │   ├── postApi.js
│   │   ├── tagApi.js
│   │   └── userApi.js
│   ├── components/
│   │   ├── navbar.js
│   │   ├── postCard.js
│   │   ├── tagPill.js
│   │   ├── loader.js
│   │   └── errorMessage.js
│   ├── pages/
│   │   ├── feed.js
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── post.js
│   │   ├── dashboard.js
│   │   ├── editor.js
│   │   ├── profile.js
│   │   └── tags.js
│   ├── utils/
│   │   ├── auth.js
│   │   ├── storage.js
│   │   ├── validation.js
│   │   └── markdown.js
│   └── main.js
└── assets/
    └── images/
```

If a small additional file is genuinely needed, add it in the appropriate existing directory. Do not reorganize the whole project unnecessarily.

## 5. Required Product Features

The frontend must support the PRD's MVP functionality:

### Authentication

- Register with name, email, password
- Login with email and password
- Receive JWT from backend
- Persist authentication across refreshes using localStorage
- Send JWT as:
  `Authorization: Bearer <token>`
- Logout by clearing the client session
- Protected pages require authentication
- Redirect unauthenticated users to login
- Never display or store the user's password after submission

### Public Feed

- Show published posts only
- Newest posts first
- Post card includes:
  - cover image
  - title
  - excerpt
  - author
  - date
  - tags
- Search posts by title keyword
- Support tag filtering
- Open a post by slug

### Post Detail

- Fetch a post using its slug
- Show title, author, date, cover image, tags and content
- Render Markdown
- Support headings, bold/italic text, links, lists
- Render fenced code blocks with syntax highlighting
- Provide useful loading and error states

### Tags

- Show all available tags
- Show post counts for tags
- Open a tag and show its published posts
- Tag URLs should use the tag slug

### Dashboard

- Protected page
- Show the logged-in user's drafts and published posts
- Provide create, edit and delete actions
- Show status clearly
- Delete must require confirmation
- Only the backend decides whether the user owns the post

### Editor

- Protected page
- Create a new post
- Edit an existing post
- Fields:
  - title
  - Markdown content
  - cover image URL
  - tags
  - status
- Status supports:
  - draft
  - published
- Provide Markdown live preview
- Use existing tags and allow creation of a new tag through the backend flow
- Validate required fields before sending
- Show API errors clearly

### Public Profile

- Show user's name
- Bio
- Avatar URL/image
- Published posts only
- Draft posts must never appear publicly

### Settings

- Protected page
- Edit own:
  - display name
  - bio
  - avatar URL

## 6. Backend API Contract

Do not invent different endpoint names.

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Posts

```text
GET    /api/posts
GET    /api/posts/:slug
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
GET    /api/posts/mine
```

### Tags

```text
GET /api/tags
GET /api/tags/:slug/posts
```

### Users

```text
GET /api/users/:id
PUT /api/users/me
```

Public endpoints must remain usable without a JWT.

Protected endpoints must send the JWT in the Authorization header.

Use the actual backend implementation as the final integration reference if it differs slightly from the original PRD.

## 7. Page Mapping

Use these simple HTML pages:

```text
/                     -> index.html / public feed
/login                -> pages/login.html
/register             -> pages/register.html
/post/:slug           -> pages/post.html?slug=...
/tag/:slug            -> pages/tags.html?slug=...
/dashboard            -> pages/dashboard.html
/editor/new           -> pages/editor.html
/editor/:id           -> pages/editor.html?id=...
/profile/:id          -> pages/profile.html?id=...
/settings             -> pages/settings.html
```

Because this is not React Router, use normal HTML navigation plus URL query parameters or path parsing in JavaScript.

Do not create a custom SPA router unless it is actually necessary.

## 8. API Module Rules

All API communication should be centralized in:

```text
client/js/api/
```

Examples:

- `authApi.js` — register, login, getMe
- `postApi.js` — get posts, get post, create, update, delete, get mine
- `tagApi.js` — get tags, get posts by tag, create tag if supported
- `userApi.js` — get public profile, update own profile

Do not write repeated `fetch()` code directly inside every page.

Create small reusable helpers for:

- API base URL
- Authorization header
- JSON parsing
- common error handling

## 9. Authentication Rules

Use:

```text
localStorage
```

for the current JWT.

Example conceptual flow:

```text
Login
  ↓
POST /api/auth/login
  ↓
receive JWT
  ↓
localStorage.setItem(...)
  ↓
future protected fetch()
  ↓
Authorization: Bearer <token>
```

On protected page load:

1. Check for token.
2. If missing, redirect to login.
3. If present, call the appropriate protected API.
4. If the API reports an invalid/expired token, clear the session and redirect to login.

Do not put secrets in frontend code.

## 10. UI / Design Direction

The visual design should be inspired by modern developer/community platforms and can take inspiration from Discord's information hierarchy:

- strong left navigation where useful
- clear content hierarchy
- compact but readable cards
- rounded panels
- subtle borders
- comfortable spacing
- clear active/hover/focus states
- developer-focused typography
- code-friendly visual treatment
- responsive layout
- polished empty/loading/error states

This is a visual direction, not a request to copy Discord's proprietary UI exactly.

The design must still feel like a developer blogging platform rather than a chat application.

Use the `web-design-guidelines` skill for accessibility, interaction, spacing, typography, responsive behavior, and component quality.

## 11. Accessibility

Every interactive element should be keyboard accessible.

Use:

- semantic HTML
- proper `<label>` elements
- visible focus states
- accessible button names
- sufficient text contrast
- alt text for meaningful images
- appropriate heading hierarchy
- useful form error messages

Do not rely on color alone to communicate status.

## 12. Responsive Design

The interface must work on:

- desktop
- tablet
- mobile widths

Do not design only for a large desktop screen.

The PRD explicitly evaluates responsive usability and clean content hierarchy.

## 13. Loading / Empty / Error States

Every API-driven page should handle:

- loading
- successful data
- empty data
- API error
- invalid/missing data

Do not leave users with a blank screen while an API request is running.

Use reusable:

```text
loader.js
errorMessage.js
```

where appropriate.

## 14. Markdown and Security

Post content is user-generated Markdown.

The frontend must render Markdown safely.

Do not use unsafe raw `innerHTML` for untrusted content without proper sanitization.

Fenced code blocks must support syntax highlighting.

Links and rendered HTML must not create an obvious XSS path.

## 15. Ownership and Authorization

Frontend controls are for user experience only.

Never assume hiding an Edit/Delete button is security.

The backend already enforces ownership for post update/delete.

If the backend returns unauthorized/forbidden, show a useful message and do not attempt to bypass it.

## 16. Coding Style

Prefer simple, readable JavaScript:

- `const` / `let`
- async/await
- ES modules
- small functions
- descriptive names
- no unnecessary abstractions
- no giant single JavaScript file
- no duplicated API logic

Comments should explain non-obvious logic, not obvious syntax.

## 17. Implementation Order

Build and test in this order:

1. Frontend base layout and global styles
2. API helper/base configuration
3. Authentication storage/helper
4. Navbar
5. Login
6. Register
7. Public feed
8. Post card
9. Post detail + Markdown
10. Tags and tag filtering
11. Dashboard
12. Editor create
13. Editor edit
14. Delete confirmation
15. Public profile
16. Settings
17. Loading/empty/error states
18. Responsive/accessibility polish
19. Full frontend-backend integration testing
20. Final cleanup and deployment preparation

Do not build all pages blindly at once. After each stage, run the page and verify it against the real backend API.

## 18. Do Not Change These Backend Assumptions

The backend is already implemented and tested.

Do not:

- rename backend routes without a real requirement
- change model relationships unnecessarily
- remove authentication middleware
- remove ownership checks
- expose passwords
- expose JWT secrets
- make drafts public
- bypass validation
- connect the frontend directly to MongoDB

Architecture remains:

```text
HTML/CSS/JS
      ↓
Fetch API
      ↓
Express REST API
      ↓
Mongoose
      ↓
MongoDB
```

## 19. Definition of Done

Frontend work is considered complete only when:

- visitor can browse published posts
- visitor can search/filter posts
- visitor can open a post
- Markdown renders correctly
- code blocks have syntax highlighting
- visitor can browse tags
- visitor can view public profiles
- user can register
- user can login
- token persists after refresh
- protected pages reject unauthenticated users
- user can create draft
- user can publish
- user can edit own post
- user can delete own post with confirmation
- user can update own profile
- drafts never appear publicly
- loading/empty/error states work
- responsive layout works
- frontend uses only HTML/CSS/JS
- no unnecessary framework/dependency has been introduced
- existing backend API tests remain working

## 20. Important Instruction

When asked to implement a feature, first inspect the current code and existing API.

Then:

1. Explain briefly what files will change.
2. Make the smallest clean implementation.
3. Test it.
4. Report what changed and any remaining issue.
5. Do not silently introduce a new framework or change the agreed architecture.
"""

# Create the Markdown file using the required markdown-generation path.
out = "/mnt/data/AGENTS.md"
pypandoc.convert_text(agents_md, "md", format="md", outputfile=out, extra_args=["--standalone"])
print(out)
