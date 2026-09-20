# DevLens

DevLens is an AI-powered developer toolkit for debugging code, reviewing and refactoring implementations, generating unit-test ideas, and working with regular expressions from one focused interface.

The application uses a React/Vite frontend, an Express API, Google Gemini for analysis, and MongoDB for analysis history.

## Features

- **Stacktrace & Fix** — explain errors, identify likely root causes, and suggest concrete fixes.
- **Refactor & Review** — review readability, complexity, maintainability, anti-patterns, and performance.
- **Unit Test Gen** — generate production-oriented test cases, including edge cases and asynchronous failures.
- **Regex Architect** — explain an existing expression or generate one from a natural-language requirement.
- **Analysis history** — persist the 15 most recent analyses and restore their input/output from the UI.
- **Keyboard shortcut** — run the active analysis with `Ctrl + Enter` on Windows/Linux or `Cmd + Enter` on macOS.

## How it works

```text
React + Vite frontend
          │
          │ HTTP / JSON
          ▼
Express backend
     │          │
     │          └── MongoDB: analysis history
     └───────────── Google Gemini: generated analysis
```

The browser calls the backend at `http://localhost:5001/api`. The backend keeps the Gemini credential server-side, sends the selected tool prompt and user input to Gemini, stores the result in MongoDB, and returns the generated output to the frontend.

## Tech stack

### Frontend

- React 18
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express
- Mongoose
- MongoDB
- `cors`
- `dotenv`
- Nodemon for development

### AI

- Google Gemini API

## Project structure

```text
DevLens/
├── backend/
│   ├── models/
│   │   └── Analysis.js
│   ├── .env                 # local only; never commit
│   ├── index.js             # Express API and Gemini integration
│   └── package.json
├── public/
├── src/
│   ├── App.jsx              # main UI and API calls
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Prerequisites

- Node.js 18 or newer (Node.js 20+ is recommended)
- npm
- A MongoDB deployment or local MongoDB instance
- A Google Gemini API key

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/<your-github-username>/DevLens.git
cd DevLens
```

### 2. Install dependencies

Install frontend dependencies from the repository root:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

### 3. Configure the backend

Create `backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/devlens
GEMINI_API_KEY=your_gemini_api_key
```

For MongoDB Atlas, use your Atlas connection string as `MONGO_URI`. Do not commit this file or any API key.

### 4. Start the backend

In one terminal:

```bash
cd backend
npm run dev
```

The API starts on [http://localhost:5001](http://localhost:5001) after MongoDB connects successfully. Use `npm start` for a non-watch process.

### 5. Start the frontend

In a second terminal, from the repository root:

```bash
npm run dev
```

Open the local URL printed by Vite, normally [http://localhost:5173](http://localhost:5173).

The frontend currently uses the API base URL `http://localhost:5001/api` in `src/App.jsx`. If the backend is hosted elsewhere, update that value or move it to a Vite environment variable before deployment.

## API reference

### `POST /api/analyze`

Runs an AI analysis and stores it in MongoDB.

Request:

```json
{
  "tool": "error",
  "input": "TypeError: Cannot read properties of undefined"
}
```

Supported `tool` values:

- `error`
- `refactor`
- `test`
- `regex`

Successful response:

```json
{
  "success": true,
  "id": "analysis-document-id",
  "output": "Generated analysis",
  "tokensUsed": 123
}
```

### `GET /api/history`

Returns the 15 most recent saved analyses, ordered newest first.

Example response shape:

```json
[
  {
    "_id": "analysis-document-id",
    "tool": "refactor",
    "input": "const value = ...",
    "output": "Generated analysis",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "tokensUsed": 123
  }
]
```

## npm scripts

### Frontend (`/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

### Backend (`/backend`)

| Command | Description |
| --- | --- |
| `npm start` | Start the Express server with Node |
| `npm run dev` | Start the Express server with Nodemon |

## Data and security

- Gemini and MongoDB credentials belong only in `backend/.env`.
- Never put secrets in frontend source code, browser requests, screenshots, commits, or issue reports.
- `backend/.env` is ignored by Git. If a credential has ever been exposed, revoke and rotate it before publishing.
- User-provided code and generated output are stored in MongoDB as analysis history. Treat submitted code as potentially sensitive.
- The current API enables CORS broadly for local development; restrict allowed origins before production deployment.
- Add authentication, rate limiting, request validation, and production error handling before exposing the API publicly.

## Development notes

- The backend will exit if it cannot connect to MongoDB.
- The frontend displays the backend error message when an analysis request fails.
- Generated Markdown markers are stripped from the stored/displayed output by the current implementation.
- The Gemini model and prompt configuration live in `backend/index.js`.
- Analysis records are defined in `backend/models/Analysis.js`.

## Roadmap

Potential improvements include:

- Configurable frontend API URL through Vite environment variables
- Authentication and per-user history
- Input validation and rate limiting
- Streaming Gemini responses
- Repository and pull-request analysis
- Diff-aware reviews
- Test execution and result reporting
- Exportable analysis reports
- Deployment configuration and automated CI

## Contributing

1. Fork the repository.
2. Create a focused branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Install dependencies and make your changes.
4. Verify the frontend build:

   ```bash
   npm run build
   ```

5. Commit and push your branch.
6. Open a pull request with a clear description of the change.

## License

No license has been selected yet. Add a license before accepting external contributions or redistributing the project.

---

Built with React, Vite, Node.js, Express, MongoDB, and Google Gemini.
