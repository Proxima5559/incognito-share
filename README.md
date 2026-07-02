# incognito-share

A self-destructing secret message service. Create a short link for a message that automatically expires after a time limit and/or a maximum number of views — once it's gone, it's gone.

Built with **Express 5**, **TypeScript**, **MongoDB (Mongoose)**, and **Redis** (for distributed rate limiting).

## Features

- 🔗 Generate short, unique links (via `nanoid`) for one-time or view-limited secret messages
- ⏳ Messages auto-expire after **5 minutes** (via a MongoDB TTL index) or after a configurable max view count
- 🔐 JWT-based authentication (access + refresh tokens) with bcrypt password hashing
- 🚦 Redis-backed rate limiting on auth and link-retrieval endpoints
- ✅ Request validation with Zod
- 🧱 Clean layered architecture: routers → controllers → services → models

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (TypeScript, ESM) |
| Web framework | Express 5 |
| Database | MongoDB via Mongoose |
| Cache / rate limiting | Redis via `rate-limit-redis` |
| Auth | JSON Web Tokens + bcryptjs |
| Validation | Zod |
| Dev tooling | tsx, nodemon |

## Project structure

```
incognito-share/
├── index.ts                     # Entry point — boots the App
├── seeds/
│   └── userSeed.ts              # Seeds two test users into MongoDB
├── src/
│   ├── app.ts                   # Express app bootstrap (middleware, routes, error handling)
│   ├── config/
│   │   ├── index.ts              # connectDB export
│   │   ├── mongo.config.ts       # Mongoose connection
│   │   └── redis.config.ts       # Redis client connection
│   ├── controllers/
│   │   ├── autController.ts      # Auth controller (register/login/refresh/logout/me/delete)
│   │   └── urlGenController.ts   # Short-link create/retrieve controller
│   ├── interfaces/                # Shared TypeScript interfaces (IUser, IUrl, ...)
│   ├── middlewares/
│   │   ├── auth.ts                # JWT auth guard
│   │   ├── errorHandler.ts        # Centralized error handler
│   │   ├── rateLimiter.ts         # Redis-backed rate limiters (auth + url retrieval)
│   │   ├── schemes/                # Zod schemas (register, login, create URL)
│   │   └── validation/urlGenValidator.ts  # Generic Zod `validate` middleware
│   ├── models/
│   │   ├── authModel.ts           # Mongoose User model (password hashing hooks)
│   │   └── urlGenModel.ts         # Mongoose UrlGen model (TTL index on expiresAt)
│   ├── routers/
│   │   ├── index.ts               # Mounts /auth and /urls under /api/v1
│   │   ├── authRouter.ts          # Auth routes
│   │   └── urlRouter.ts           # Short-link routes
│   ├── services/
│   │   ├── authService.ts         # Auth business logic
│   │   ├── tokenService.ts        # JWT issuing/verification
│   │   └── urlService.ts          # Short-link creation & view/expiry logic
│   └── utils/
│       ├── appError.ts            # Typed AppError helper (BadRequest, NotFound, Gone, ...)
│       └── configVar.ts           # Zod-validated environment config
├── types/
│   └── express.d.ts               # Express Request augmentation (req.user)
├── package.json
└── tsconfig.json
```

## Getting started

### Prerequisites

- Node.js 18+
- A running MongoDB instance
- A running Redis instance

### Installation

```bash
git clone https://github.com/Proxima5559/incognito-share.git
cd incognito-share
npm install
```



### Running the app

```bash
npm run dev
```

This starts the server with `nodemon` + `tsx`, connecting to MongoDB and Redis before listening on `PORT` (default `3000`).

### Seeding test users

```bash
npm run seed:users
```

Creates two test accounts (`user1@example.com` / `user2@example.com`, password `password123`) for local testing.

## API reference

All routes are prefixed with `/api/v1`.

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth required | Rate limited | Description |
|---|---|---|---|---|
| POST | `/register` | No | Yes | Register a new user (`username`, `email`, `password`, `confirmPassword`) |
| POST | `/login` | No | Yes | Log in with `email` + `password`, returns access & refresh tokens |
| POST | `/refresh` | No | No | Exchange a valid refresh token for a new token pair |
| POST | `/logout` | Yes | No | Invalidate the current user's refresh token |
| GET | `/me` | Yes | No | Get the authenticated user's profile |
| DELETE | `/delete` | Yes | No | Delete the authenticated user's account |

**Password requirements:** at least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character.

### Short links — `/api/v1/urls`

| Method | Endpoint | Auth required | Rate limited | Description |
|---|---|---|---|---|
| POST | `/create` | Yes | No | Create a self-destructing short link |
| GET | `/:shortId` | No | Yes (1000 / 15 min) | Retrieve and "consume" a message |

**Create a link — request body:**

```json
{
  "label": "optional note",
  "message": "the secret content to share",
  "maxViews": 1
}
```

- `message` is required.
- `maxViews` is optional; if omitted, the link is limited only by its 5-minute expiry.

**Create a link — response:**

```json
{
  "message": "Short URL created successfully!",
  "shortId": "aB3xQz",
  "url": "http://localhost:3000/api/v1/urls/aB3xQz",
  "expiresAt": "2026-07-02T12:05:00.000Z",
  "maxViews": 1
}
```

**Retrieve a link — behavior:**

- Returns `404` if the link doesn't exist.
- Returns `410 Gone` if the link has expired or its view count has been exhausted.
- Each successful retrieval decrements `maxViews`; the record is deleted from MongoDB once it hits zero or expires (also enforced server-side by a MongoDB TTL index on `expiresAt`).

## Rate limiting

Both limiters are backed by Redis via `rate-limit-redis`:

- **Auth endpoints** (`/register`, `/login`): 10 requests / 15 minutes
- **Link retrieval** (`GET /:shortId`): 1000 requests / 15 minutes

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run seed:users` | Seed the database with two test users |
