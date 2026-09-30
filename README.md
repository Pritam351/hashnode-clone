# Hashnode Clone

A full-stack developer blogging platform built as an independent educational project.

The original specification describes a MERN/React application. This repository intentionally uses a **vanilla HTML/CSS/JavaScript frontend** with an **Express.js + MongoDB backend**.

> This project is independent and is not affiliated with or endorsed by Hashnode.

## Stack

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript ES modules
- Fetch API
- Local Storage
- Markdown rendering
- Prism syntax highlighting

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- CORS

## Features

- User registration and login
- JWT authentication
- bcrypt password hashing
- Protected operations
- Logout
- Create, edit and delete posts
- Draft/published posts
- Post ownership checks
- Slugs
- Public feed and search
- Markdown and code highlighting
- Tags and tag filtering
- Public profiles
- Profile settings
- Loading, empty and error states
- Responsive UI

## Architecture

```text
Browser
   |
   | HTML/CSS/JavaScript + Fetch
   v
Express.js
   |    |  \-- /api/*
   |
   +---- client/*
          |
          v
       MongoDB
```

The Express server serves both the frontend and REST API. The frontend does not connect directly to MongoDB.

## Project Structure

```text
hashnode-clone/
├── client/
│   ├── index.html
│   ├── pages/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── post.html
│   │   ├── dashboard.html
│   │   ├── editor.html
│   │   ├── profile.html
│   │   ├── settings.html
│   │   └── tags.html
│   ├── css/
│   ├── js/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── main.js
│   └── assets/
├── server/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── .env
│   ├── server.js
│   └── package.json
├── .gitignore
├── AGENTS.md
├── PRD.docx
└── README.md
```

# Local Setup

## 1. Prerequisites

Install:

- Node.js LTS
- npm
- MongoDB Community Server or MongoDB Atlas
- Git

Check:

```bash
node -v
npm -v
```

## 2. Clone

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd hashnode-clone
```

## 3. Install dependencies

The backend `package.json` is inside `server/`.

```bash
cd server
npm install
```

## 4. Environment variables

Create:

```text
server/.env
```

Use the variable names expected by `server/config/db.js` and the authentication code. The current project convention is:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

Do not commit the real `.env` file.

A safe example file can contain:

```env
MONGO_URI=
JWT_SECRET=
PORT=5000
```

## 5. Start locally

From `server/`:

```bash
npm start
```

Then open:

```text
http://localhost:5000/
```

Use the Express server to run the complete application.

**Do not open `client/index.html` with `file://`.**

The application needs HTTP because it uses ES modules, API requests and Express static serving.

# Very Important: Browser URLs vs File Paths

This project caused deployment/navigation problems because the repository directory `client/` was confused with the public browser root.

Express serves:

```text
client/
```

as the website root.

Therefore:

| Repository file | Browser URL |
|---|---|
| `client/index.html` | `/` |
| `client/pages/login.html` | `/pages/login.html` |
| `client/pages/register.html` | `/pages/register.html` |
| `client/pages/tags.html` | `/pages/tags.html` |
| `client/pages/dashboard.html` | `/pages/dashboard.html` |
| `client/pages/editor.html` | `/pages/editor.html` |
| `client/pages/profile.html` | `/pages/profile.html` |
| `client/pages/settings.html` | `/pages/settings.html` |
| `client/pages/post.html` | `/pages/post.html` |

### Correct

```javascript
window.location.href = "/";
window.location.href = "/pages/login.html";
window.location.href = "/pages/dashboard.html";
```

### Incorrect for this Express deployment

```javascript
window.location.href = "/client/index.html";
window.location.href = "/client/pages/login.html";
```

Do not blindly replace every `/client/` occurrence in the source code: paths used internally by `server/server.js`, such as `express.static(...)`, may correctly refer to the filesystem.

# Home and Tag URLs

The home page is exposed at:

```text
/
```

not:

```text
/client/index.html
```

If the feed reads a tag query parameter, use:

```text
/?tag=node-js
```

not:

```text
/client/index.html?tag=node-js
```

This is why a URL such as `/client/index.html?tag=fullstack` can produce `Cannot GET`.

# API Configuration

The backend mounts these route groups:

```text
/api/auth
/api/tags
/api/posts
/api/users
```

For the current architecture, the frontend should preferably use a relative API base:

```javascript
export const API_BASE_URL = "/api";
```

This is important because hard-coding:

```text
http://localhost:5000/api
```

works only on the developer's machine.

With `/api`:

```text
Local:
http://localhost:5000/api

Production:
https://YOUR-RENDER-SERVICE.onrender.com/api
```

The browser automatically uses the current host.

Before deployment, search the project for:

```text
localhost
```

and verify no production frontend request is still pointing to a local server.

# Authentication

Authentication flow:

```text
POST /api/auth/register
        |
        v
Login
        |
        v
POST /api/auth/login
        |
        v
JWT returned
        |
        v
Token stored in Local Storage
        |
        v
Authorization: Bearer <token>
        |
        v
Protected API request
```

The project also uses:

```text
GET /api/auth/me
```

to validate the current authenticated user.

Registration does **not** automatically authenticate the user; login is a separate step.

The JWT uses `JWT_SECRET` and currently has a 7-day expiration according to the authentication implementation.

# Backend API Groups

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Posts:

```text
/api/posts
```

Tags:

```text
/api/tags
```

Users/profiles:

```text
/api/users
```

The exact controller behavior and ownership rules are implemented in the corresponding route/controller files.

# Database

The main Mongoose models are:

```text
User
Post
Tag
```

Posts reference their author and tags.

The public feed must expose published posts, while ownership checks remain enforced server-side for protected post operations.

# Render Deployment

The recommended deployment for this repository is **one Render Web Service**.

```text
Render Web Service
        |
        +-- Express
        |     |
        |     +-- client frontend
        |     |
        |     +-- /api
        |
        +-- MongoDB Atlas
```

This is simpler than deploying the vanilla frontend separately because the current Express application already serves the frontend.

## Render settings

Because the Node package is inside `server/`, configure Render so its working/root directory is:

```text
server
```

Then use:

```text
Build Command:
npm install
```

```text
Start Command:
npm start
```

If your Render configuration instead keeps the repository root as the working directory, use commands that explicitly enter `server/`. The important point is that the command must run the `server/package.json`.

## Render environment variables

Set the production values in Render:

```text
MONGO_URI
JWT_SECRET
```

The server should listen using the platform-provided port:

```javascript
const PORT = process.env.PORT || 5000;
```

Do not hard-code the production port.

# Critical Render Checklist

Before deploying, search the entire repository for:

```text
/client/
```

```text
localhost
```

```text
window.location
```

```text
href=
```

```text
API_BASE_URL
```

Check these files especially:

```text
client/js/api/apiClient.js
client/js/main.js
client/js/components/navbar.js
client/js/utils/auth.js
client/js/pages/login.js
client/js/pages/tags.js
client/js/pages/post.js
client/js/components/postCard.js
client/js/components/tagPill.js
server/server.js
```

Make sure:

```text
Home        -> /
Pages       -> /pages/...
API         -> /api/...
```

and not:

```text
/client/index.html
/client/pages/...
http://localhost:5000/api
```

# Why Deployment Problems Happened

## `Cannot GET /client/index.html`

`client` is a filesystem directory, not the public URL prefix.

Express exposes its contents at the root.

Therefore:

```text
client/index.html
```

is requested through:

```text
/
```

## Login redirect error

A redirect such as:

```javascript
window.location.href = "/client/index.html";
```

requests a URL that Express does not expose.

Use:

```javascript
window.location.href = "/";
```

## Logout redirect error

The same rule applies to logout. Return to:

```text
/
```

rather than:

```text
/client/index.html
```

## Tag `Cannot GET`

A generated URL such as:

```text
/client/index.html?tag=fullstack
```

uses the wrong public path.

Use:

```text
/?tag=fullstack
```

when the feed is implemented on the root page.

## API works locally but not on Render

Search for:

```text
localhost
```

A production browser cannot use the developer's localhost server.

For the single Express service, use:

```javascript
"/api"
```

as the API base.

# Testing Before Push

Test locally through Express, not by opening HTML files directly.

Check:

### Public

- Home
- Tags
- Tag filtering
- Individual post
- Public profile

### Authentication

- Register
- Login
- Invalid login
- Logout
- Refresh after login
- Invalid/expired token behavior

### Protected

- Dashboard
- Editor
- Settings

### Posts

- Create draft
- Edit
- Publish
- View published post
- Delete own post
- Verify server-side ownership protection

### Direct URL testing

Do not test only by clicking links.

Paste these kinds of URLs directly into the browser:

```text
/
 /pages/login.html
 /pages/register.html
 /pages/tags.html
 /pages/post.html?slug=...
 /pages/profile.html?id=...
 /?tag=...
```

Refresh each page and confirm it still works.

# Debugging Production

Open browser DevTools.

## Console

Check for:

```text
404
Failed to fetch
CORS
Failed to load module script
JavaScript errors
```

## Network

Check:

- HTML requests
- JavaScript requests
- CSS requests
- API requests
- status codes
- requested URLs

If you see:

```text
/client/...
```

in a browser request, verify whether it should actually be:

```text
/pages/...
```

or:

```text
/
```

# Markdown

Post content is stored as Markdown.

The frontend uses Markdown rendering and Prism syntax highlighting.

If Markdown appears as raw text:

1. Check Console.
2. Check Network.
3. Verify the required CDN scripts load.
4. Check `client/js/utils/markdown.js`.
5. Check `client/pages/post.html`.
6. Confirm the Markdown renderer is available before post rendering executes.

# Security

Never commit:

```text
server/.env
```

Never publish:

- MongoDB passwords
- JWT secrets
- API keys
- private credentials

Passwords must remain hashed with bcryptjs.

Authorization must be enforced by the backend; client-side hiding alone is not security.

# Git Workflow

Check:

```bash
git status
```

Review:

```bash
git diff
```

Stage:

```bash
git add .
```

Commit:

```bash
git commit -m "Update deployment and routing configuration"
```

Push:

```bash
git push origin main
```

If Render auto-deploy is enabled, the new GitHub commit will trigger deployment.

# Troubleshooting Rule

When a problem appears after deployment:

1. Inspect the current implementation.
2. Identify the exact failing URL/request.
3. Check browser Console and Network.
4. Search the project for the incorrect path or hostname.
5. Make the smallest targeted change.
6. Test locally through Express.
7. Test direct URLs.
8. Push only after local verification.

Avoid large rewrites when the actual issue is a URL, static path, API base URL, environment variable, or Render configuration.

# Quick Start

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd hashnode-clone
cd server
npm install
npm start
```

Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
PORT=5000
```

Open:

```text
http://localhost:5000/
```

# Final Rules to Remember

```text
Repository:
client/index.html

Browser:
/

Pages:
 /pages/login.html
 /pages/register.html
 /pages/tags.html
 /pages/dashboard.html
 /pages/editor.html
 /pages/profile.html
 /pages/settings.html
 /pages/post.html

API:
 /api/...

Do not use:
 /client/index.html
 /client/pages/...
 http://localhost:5000/api in production
```

The most important deployment principle is:

**`client/` is the repository directory; it is not the public URL prefix.**
