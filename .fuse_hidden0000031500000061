# Taghyeer Chat

Real-time 1-on-1 and group chat with phone-number auth, Socket.IO realtime, unread notifications, draft saving, and intelligent auto-scroll.

**Live demo:** [Live Link - Click Here](https://taghyeer-chat.netlify.app/)
**API docs:** [API.md](./API.md)

---

## Table of contents

- [Tech stack](#tech-stack)
- [Setup](#setup)
- [Environment variables](#environment-variables)
- [Architecture](#architecture)
- [API usage](#api-usage)
- [Deployment](#deployment)
- [Implementation decisions](#implementation-decisions)
- [Known limitations](#known-limitations)
- [What could be improved with more time](#what-could-be-improved-with-more-time)
- [Use of AI tools](#use-of-ai-tools)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| State | React Query 5 (server), Zustand 5 (client) |
| Realtime | Socket.IO 4 |
| Package manager | Bun |

## Setup

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The app talks to a hosted backend by default (see [Environment variables](#environment-variables)), so no local API server is required to run it.

Other scripts:

```bash
bun run build   # production build
bun run start   # serve the production build
bun run lint    # eslint
```

## Environment variables

Defaults in `services/config.ts` point to hosted backend (zero config needed). Override only if using a different backend:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | REST API base |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO origin |
| `NEXT_PUBLIC_HEALTH_URL` | Health-check endpoint |

## Architecture

Clean separation: UI components → hooks (state logic) → services (API/Socket) → stores (global state).

- **Components**: one per responsibility (chat-window, message-list, sidebar, etc.)
- **Hooks**: auth, messages, send, socket, auto-scroll, group management
- **Services**: API wrappers + Socket.IO singleton
- **Stores (Zustand)**: auth token, active conversation, connection status, unread counts
- **React Query**: messages, conversations (server state, not global)

### Realtime messaging

Socket.IO patches React Query cache on `message:new` instead of refetching. Send tries socket first, falls back to REST when disconnected.

### Auto-scroll

Scrolls to bottom on load, auto-scrolls on new messages only if already near bottom. Never forces scroll if user has scrolled up to read history.

## API usage

Full endpoint reference in [API.md](./API.md). Group creation uses separate `POST /conversations/group` endpoint (not overloaded on direct endpoint).

## Deployment

Import to Vercel. No env vars needed for default backend. Build auto-detected as Next.js.

## Implementation decisions

- **Mobile**: single-pane layout; select conversation to view thread with back button
- **Colors**: deterministic hash of conversation name for stable accent colors
- **Connection**: combines browser online/offline + `/health` poll + Socket.IO state. Offline blocks Send; socket-only loss is degraded
- **RTL**: messages use `dir="auto"` for automatic language direction
- **Groups**: require 3+ members; creator excluded from participantIds
- **Failed sends**: stay visible as retryable bubbles (don't silently discard)
- **No self-echo**: backend doesn't send messages back to sender; list is invalidated instead
- **Unread**: derived client-side from socket stream (zero extra requests)
- **Landing page**: reuses production chat components with scripted demo timeline

## Known limitations

- **No typing indicators / read receipts**: backend only sends `message:new`/`conversation:updated`
- **No cross-session unread counts**: only tracks live socket messages (shows dot if offline)
- **No consecutive-message grouping**: messages from same sender aren't merged
- **Socket messages use temp IDs**: until next conversation refetch

## What could be improved

- Consecutive-message grouping and per-day date separators
- Visual offline send queue with reconnect flush
- Message search within conversation
- Automated test coverage

## Use of AI tools

ChatGPT planning and markdown text generate from my written brief, Free Claude use for some page generate, free OpenCode and Antigravity use for implementation, vscode Copilot for refactoring. All code reviewed and tested against live API. Bonus features: draft preservation, client-derived unread notifications, socket-first/REST-fallback send with duplicate-avoidance.
