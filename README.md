# Taghyeer Chat

A real-time 1-on-1 and group chat application built for the frontend assessment. Phone-number based auth (auto-register on first login), Socket.IO-driven realtime messaging with a REST fallback, and a set of UX details (unread notifications, draft preservation, intelligent auto-scroll) implemented against a fixed third-party backend with no unread/read-receipt/typing support of its own.

**Live demo:** _add your deployed URL here, e.g. `https://taghyeer-chat.vercel.app`_
**API documentation:** [API.md](./API.md)

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
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript (strict), Tailwind CSS 4-no component library, bespoke Tailwind components |
| Server/API state | TanStack React Query 5 |
| Client/UI state | Zustand 5 (auth token, active conversation, connection status, unread records, toasts) |
| Realtime | socket.io-client 4 |
| Animation | Motion (landing page only) |
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

All three have working fallbacks baked into `services/config.ts` (pointing at the assessment's hosted Render backend), so the app runs with **zero configuration**. Set these only to point the app at a different backend:

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | REST API base URL | `https://frontend-task-chatapp.onrender.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server origin (root, not `/api`) | `https://frontend-task-chatapp.onrender.com` |
| `NEXT_PUBLIC_HEALTH_URL` | Health-check endpoint used by the connection banner | `${NEXT_PUBLIC_SOCKET_URL}/health` |

When deploying, set these in the hosting platform's dashboard (e.g. Vercel → Project Settings → Environment Variables) if you're pointing at a different backend than the default.

## Architecture

Strict separation between UI, data access, and state:

```
app/            Routes: / (landing), /login, /chat
components/
  chat/         One component per responsibility (message-list, message-bubble,
                composer, sidebar, group-info-panel, start-chat-panel, ...)
  layout/       App chrome (icon rail, top bar, account menu)
  feedback/     Connection banner, toast stack
  ui/           Presentational primitives with no domain knowledge (skeleton, modal, ...)
  marketing/    Landing page-reuses real chat components with scripted demo data
hooks/          One hook per concern (use-auth, use-messages, use-send-message,
                use-socket, use-auto-scroll, use-group-management, ...)
services/
  api/          Thin fetch wrappers per resource, routed through a shared apiRequest<T>()
  socket/       Module-level Socket.IO client singleton
store/          Zustand: auth token, active conversation, connection status,
                unread records, toasts-each store minimal and single-purpose
types/          Domain types shared across layers (Message, Conversation, etc.)
utils/          Pure functions only (message merge/dedup, date formatting, sorting)
```

Messages, conversations, and loading/sending status intentionally live in React Query cache and local component state-**not** in a global store. Zustand is reserved for state that genuinely needs to be global and doesn't belong to a server resource (the auth token, which conversation is active, connection status, unread counters).

### Realtime messaging

Socket.IO is the backend's only realtime mechanism (confirmed against the live API-no SSE, no long-polling). `hooks/use-socket.ts` subscribes once per session and:

- patches the React Query cache directly on `message:new` instead of refetching,
- recovers from events missed while disconnected by invalidating open queries on `connect`,
- normalizes a payload shape that differs from the REST response (`id` vs `_id`, epoch-ms vs ISO timestamps-see [API.md's quirks section](./API.md#observed-quirks--bugs)).

Sending is **socket-first with a REST fallback**: a message is emitted over the socket when it's connected, and only sent via `POST /messages` when it isn't. Once an emit is in flight, its failure never falls back to REST-an ack timeout is ambiguous (the message may have already been stored and broadcast), so retrying over REST would risk a duplicate.

### Auto-scroll

`hooks/use-auto-scroll.ts` is pure scroll-position logic with no data dependency: scrolls to bottom on initial load and conversation switch, auto-scrolls on new messages only while the user is already near the bottom, and never yanks the viewport if they've scrolled up to read history-a "jump to latest" button appears instead.

## API usage

Full endpoint reference-methods, request/response shapes, status codes, query/path params, auth header, and known quirks in the live backend-is documented in **[API.md](./API.md)**, not duplicated here.

One endpoint-shape decision worth calling out: group creation is a separate `POST /conversations/group` rather than overloading `POST /conversations` with a `type` field (the latter is direct-only and rejects `type: "group"` on the live backend).

## Deployment

Deployed on [Vercel](https://vercel.com):

1. Import this repository into Vercel.
2. No environment variables are required to run against the default hosted backend (see above)-set the three `NEXT_PUBLIC_*` vars only if pointing at a different backend.
3. Vercel auto-detects Next.js; default build (`next build`) and output settings work unmodified.

## Implementation decisions

- **Responsive layout**: On mobile, the two-pane chat layout (conversation list + thread) collapses into a single pane-selecting a conversation swaps to the thread view with a back button, and the icon rail folds account/sign-out into the top bar.
- **Conversation accent colors**: each conversation's sidebar accent is derived from a deterministic hash of its name, so a person/group's color stays stable everywhere it appears.
- **Connection state**: three signals (browser online/offline events, a `GET /health` poll, and Socket.IO connection state) combine into one connection store. Losing the browser link or the API disables Send and shows a persistent banner (draft text still saves); losing only the socket is treated as merely degraded, since REST sending still works.
- **RTL text**: message bubbles and the composer use `dir="auto"` so right-to-left languages render correctly without forcing the whole layout RTL.
- **Group creation UX**: a single "Create New Conversation" modal with Direct/Group tabs sharing one user-search component. The backend requires 3+ total members and excludes the creator from `participantIds`-selecting exactly one person doesn't satisfy that, so the UI detects it and offers to start a direct chat instead, rather than failing on submit.
- **Group management**: rename/add/remove/promote are gated on `admins.includes(currentUserId)` in the UI, since the backend enforces the same admin-only rule server-side (`403` otherwise). "Leave group" is the remove endpoint called with your own id, available to everyone.
- **Failed sends stay visible**: a failed message stays inline as a retryable bubble instead of being silently discarded-deliberately deviating from a toast-and-forget pattern, since losing what the user typed on a transient network error is worse UX.
- **No self-echo from the server**: testing with multiple sockets showed the backend never delivers `message:new` back to the sender (not on the sending socket, not in another tab, and not for REST sends). Sending therefore also invalidates the conversation list, or the sidebar preview/ordering would go stale after every message you send.
- **Unread notifications** (see [bonus features](#use-of-ai-tools) below) are derived entirely client-side from the `message:new` stream that already reaches every participant-zero extra network requests-since the backend has no unread-count or read-receipt concept.
- **Landing page**: reuses the actual production chat components (`MessageList`, `MessageBubble`, `MessageComposer`, the real auto-scroll hook) driven by a scripted demo timeline, rather than screenshots or a fake mockup-what a visitor sees on `/` is the same code that runs after login.

## Known limitations

- **No typing indicators or read receipts**-the backend relays nothing but `message:new`/`conversation:updated`; there's no channel for peer signals like "is typing" or "has read," so these aren't implementable without backend changes. The landing page's typing indicator is scripted demo theater only.
- **No true unread counts across sessions**-because unread state is derived only from live socket traffic, a message that arrived while the app was closed can't be counted precisely; the sidebar shows an unseen **dot** rather than a number in that case.
- **No consecutive-message grouping**-messages from the same sender sent back-to-back aren't visually merged into one block (noted as optional in the assessment spec).
- **Socket-sent messages keep a temporary id** until the conversation's next natural refetch, because the send acknowledgment is only `{ok:true}`/`{ok:false}` and never returns the created message-a deliberate trade-off against invalidating (and re-fetching) on every single send.

## What could be improved with more time

- Consecutive-message grouping and per-day date separators in the message list.
- A visual offline send queue (currently descoped-failed/offline sends surface as retryable bubbles rather than an auto-flushing queue) with reconnect-triggered flush.
- Message search within a conversation.
- Automated test coverage (unit tests for `utils/messages.ts` merge/dedup logic and `use-auto-scroll`, integration tests for the send/retry flow)-currently verified manually and via `next build`/`lint`.

## Use of AI tools

AI tools were used at different stages of the project. ChatGPT helped with planning and with correcting and formatting draft Markdown files. Implementation work used the free versions of OpenCode and Gemini, while VS Code Copilot was used for refactoring and code review. Some pages were initially generated with Claude's free tier and then reviewed and adapted to fit the application. All AI-generated code and content was reviewed, tested against the running app, and adjusted before being kept-API behavior in particular (socket payload shapes, self-echo behavior, admin-only endpoints) was verified empirically against the live backend rather than assumed, and those findings are recorded in [API.md](./API.md#observed-quirks--bugs).

Bonus features that came out of this process and aren't generic checkbox items: unsent draft preservation per conversation, client-derived unread notifications (sidebar pill, tab title, notification panel) with bounded local storage and zero extra network requests, and a socket-first/REST-fallback send path with documented duplicate-avoidance reasoning.
