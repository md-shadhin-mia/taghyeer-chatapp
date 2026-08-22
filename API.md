# Chat API Documentation

- REST base URL: `https://frontend-task-chatapp.onrender.com/api`
- WebSocket (Socket.io) base: `https://frontend-task-chatapp.onrender.com` (root, **not** `/api`)
- Health check: `https://frontend-task-chatapp.onrender.com/health` (root, **not** `/api`)
- Auth header on every protected request: `Authorization: Bearer <token>`

## Table of contents

- [Error format](#error-format)
- [WebSocket (Socket.io)](#websocket-socketio)
- [Authentication](#authentication)
- [Users](#users)
- [Conversations](#conversations)
- [Groups](#groups)
- [Messages](#messages)
- [System](#system)
- [Observed quirks / bugs](#observed-quirks--bugs)

---

## Error format

Errors are returned as JSON with an `error` object:

```json
{
  "error": {
    "message": "Human readable message",
    "code": "MACHINE_READABLE_CODE"
  }
}
```

Validation errors additionally include a `details` array:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "name", "message": "Required" }
    ]
  }
}
```

Codes: `NO_TOKEN`, `VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `SERVER_ERROR`.

---

## WebSocket (Socket.io)

Connect to the server root (not `/api`) with the JWT in the handshake `auth`.

```js
import { io } from "socket.io-client";

const socket = io("https://frontend-task-chatapp.onrender.com", {
  auth: { token }, // JWT from POST /auth/login
});

socket.on("connect", () => console.log("connected", socket.id));
socket.on("connect_error", (err) => console.error("rejected:", err.message));
```

### client → server: `message:send`

Send a message over the socket.

#### Payload

| Field | Type | Required |
|---|---|---|
| conversationId | string | Yes |
| text | string | Yes |

#### Example

```js
socket.emit(
  "message:send",
  { conversationId: "6a8869d9e5d6aac97522c4b0", text: "Ei je, ekhon free?" },
  (ack) => console.log("ack:", ack)
);
```

#### Acknowledgement

The ack is a bare status object-it does **not** contain the created message:

```json
{ "ok": true }
```

```json
{ "ok": false, "error": "Conversation not found" }
```

The message is delivered to the *other* participants as `message:new`. The sender
receives no echo, so a client that sends this way never learns the new message's
`_id` or server `createdAt` until it refetches the conversation.

### server → client: `message:new`

Fired when a new message arrives.

#### Example

```json
{
  "_id": "6a8869dbe5d6aac97522c4ba",
  "conversation": "6a8869d9e5d6aac97522c4b0",
  "sender": "6a8869c0e5d6aac97522c455",
  "text": "Assalamu alaikum, Nusrat! Kemon acho?",
  "createdAt": "2026-08-21T15:08:11.121Z"
}
```

### server → client: `conversation:updated`

Fired when a group you're in changes (created, renamed, members/admins).

#### Example

Observed payload (note: **no** `createdAt`, `updatedAt`, or `lastMessage`-see quirks):

```json
{
  "_id": "6a886a21e5d6aac97522c5c2",
  "type": "group",
  "name": "Purano Dhaka Bondhu Adda",
  "createdBy": "6a8869c0e5d6aac97522c455",
  "admins": ["6a8869c0e5d6aac97522c455", "6a8869c7e5d6aac97522c469"],
  "participants": [
    { "_id": "6a8869c0e5d6aac97522c455", "name": "Rafiq Islam", "phone": "+8801711223344" },
    { "_id": "6a8869c7e5d6aac97522c469", "name": "Nusrat Jahan", "phone": "+8801912345678" }
  ]
}
```

Fires on group creation, rename, member add/remove, and admin promotion. **Every**
participant receives it-including the person who made the change, and including a
member who was just removed (their own id is simply absent from `participants`,
which is how a client detects "I was removed").

---

## Authentication

## POST /auth/login

Log in or register with a phone number and name.

### Request

| Field | Type | Required |
|---|---|---|
| phone | string | Yes |
| name | string | Yes |

### Example

```json
{
  "phone": "+8801711223344",
  "name": "Rafiq Islam"
}
```

### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6a8869c0e5d6aac97522c455",
    "name": "Rafiq Islam",
    "phone": "+8801711223344",
    "createdAt": "2026-08-21T15:07:44.643Z"
  }
}
```

### Errors

Missing `name`-`400 VALIDATION_ERROR`:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "name", "message": "Required" }]
  }
}
```

## GET /auth/me

Returns the current logged-in user.

### Request

No body. No path or query parameters.

### Example

```
GET /api/auth/me
Authorization: Bearer <token>
```

### Response

```json
{
  "_id": "6a8869c0e5d6aac97522c455",
  "name": "Rafiq Islam",
  "phone": "+8801711223344",
  "createdAt": "2026-08-21T15:07:44.643Z"
}
```

### Errors

No token-`400 NO_TOKEN`:

```json
{
  "error": { "message": "No token provided", "code": "NO_TOKEN" }
}
```

---

## Users

## GET /users/search

Search users by name or phone.

### Request

| Param | In | Type | Required |
|---|---|---|---|
| q | query | string | Yes |

### Example

```
GET /api/users/search?q=Nusrat
Authorization: Bearer <token>
```

### Response

```json
[
  {
    "_id": "6a8869c7e5d6aac97522c469",
    "name": "Nusrat Jahan",
    "phone": "+8801912345678"
  }
]
```

No matches returns `200 []`.

---

## Conversations

## GET /conversations

List the current user's conversations.

### Request

No body. No path or query parameters.

### Example

```
GET /api/conversations
Authorization: Bearer <token>
```

### Response

```json
{
  "data": [
    {
      "_id": "6a886a21e5d6aac97522c5c2",
      "type": "group",
      "name": "Purano Dhaka Bondhu Adda",
      "createdBy": "6a8869c0e5d6aac97522c455",
      "admins": ["6a8869c0e5d6aac97522c455", "6a8869c7e5d6aac97522c469"],
      "participants": [
        { "_id": "6a8869c0e5d6aac97522c455", "name": "Rafiq Islam", "phone": "+8801711223344" },
        { "_id": "6a8869c7e5d6aac97522c469", "name": "Nusrat Jahan", "phone": "+8801912345678" },
        { "_id": "6a8869d5e5d6aac97522c49a", "name": "Kamal Hossain", "phone": "+8801611998877" }
      ],
      "lastMessage": {
        "text": "Shobai kemon acho? Aj rate meeting ache.",
        "sender": "6a8869c0e5d6aac97522c455",
        "createdAt": "2026-08-21T15:09:26.799Z"
      },
      "updatedAt": "2026-08-21T15:09:29.022Z"
    },
    {
      "_id": "6a8869d9e5d6aac97522c4b0",
      "type": "direct",
      "participant": { "_id": "6a8869c7e5d6aac97522c469", "name": "Nusrat Jahan", "phone": "+8801912345678" },
      "lastMessage": {
        "text": "Assalamu alaikum, Nusrat! Kemon acho?",
        "sender": "6a8869c0e5d6aac97522c455",
        "createdAt": "2026-08-21T15:08:11.121Z"
      },
      "updatedAt": "2026-08-21T15:08:11.356Z"
    }
  ]
}
```

## POST /conversations

Start a direct (1-to-1) conversation.

### Request

| Field | Type | Required |
|---|---|---|
| userId | string | Yes |

### Example

```json
{ "userId": "6a8869c7e5d6aac97522c469" }
```

### Response

```json
{
  "_id": "6a8869d9e5d6aac97522c4b0",
  "participants": ["6a8869c0e5d6aac97522c455", "6a8869c7e5d6aac97522c469"],
  "createdAt": "2026-08-21T15:08:09.187Z"
}
```

## GET /conversations/{id}/messages

Paginated message history for a conversation.

### Request

| Param | In | Type | Required |
|---|---|---|---|
| id | path | string | Yes |
| limit | query | integer | No |
| before | query | string | No |

### Example

```
GET /api/conversations/6a8869d9e5d6aac97522c4b0/messages?limit=2
Authorization: Bearer <token>
```

### Response

```json
{
  "messages": [
    {
      "_id": "6a886a3de5d6aac97522c665",
      "conversation": "6a8869d9e5d6aac97522c4b0",
      "sender": "6a8869c0e5d6aac97522c455",
      "text": "Amra ki kal dekha korte pari?",
      "createdAt": "2026-08-21T15:09:49.003Z"
    },
    {
      "_id": "6a886a3be5d6aac97522c651",
      "conversation": "6a8869d9e5d6aac97522c4b0",
      "sender": "6a8869c0e5d6aac97522c455",
      "text": "Tumi ki ajke free acho?",
      "createdAt": "2026-08-21T15:09:47.826Z"
    }
  ],
  "hasMore": true
}
```

### Errors

Unknown conversation id-`404 NOT_FOUND`:

```json
{
  "error": { "message": "Conversation not found", "code": "NOT_FOUND" }
}
```

---

## Groups

## POST /conversations/group

Create a group conversation.

### Request

| Field | Type | Required |
|---|---|---|
| name | string | Yes |
| participantIds | string[] | Yes |

### Example

```json
{
  "name": "Dhaka Bondhu Adda",
  "participantIds": ["6a8869c7e5d6aac97522c469", "6a8869d5e5d6aac97522c49a"]
}
```

### Response

```json
{
  "_id": "6a886a21e5d6aac97522c5c2",
  "type": "group",
  "name": "Dhaka Bondhu Adda",
  "createdBy": "6a8869c0e5d6aac97522c455",
  "admins": ["6a8869c0e5d6aac97522c455"],
  "participants": [
    { "_id": "6a8869c0e5d6aac97522c455", "name": "Rafiq Islam", "phone": "+8801711223344" },
    { "_id": "6a8869c7e5d6aac97522c469", "name": "Nusrat Jahan", "phone": "+8801912345678" },
    { "_id": "6a8869d5e5d6aac97522c49a", "name": "Kamal Hossain", "phone": "+8801611998877" }
  ],
  "createdAt": "2026-08-21T15:09:21.268Z",
  "updatedAt": "2026-08-21T15:09:21.268Z"
}
```

### Errors

Wrong field name (`memberIds` instead of `participantIds`)-`400 VALIDATION_ERROR`:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "participantIds", "message": "Required" }]
  }
}
```

## POST /conversations/{id}/participants

Add members to a group (admins only).

### Request

| Field | Type | Required |
|---|---|---|
| id (path) | string | Yes |
| userIds | string[] | Yes |

### Example

```json
{ "userIds": ["6a886a20e5d6aac97522c5b7"] }
```

```
POST /api/conversations/6a886a21e5d6aac97522c5c2/participants
```

### Response

```json
{
  "_id": "6a886a21e5d6aac97522c5c2",
  "type": "group",
  "name": "Dhaka Bondhu Adda",
  "createdBy": "6a8869c0e5d6aac97522c455",
  "admins": ["6a8869c0e5d6aac97522c455"],
  "participants": [
    { "_id": "6a8869c0e5d6aac97522c455", "name": "Rafiq Islam", "phone": "+8801711223344" },
    { "_id": "6a8869c7e5d6aac97522c469", "name": "Nusrat Jahan", "phone": "+8801912345678" },
    { "_id": "6a8869d5e5d6aac97522c49a", "name": "Kamal Hossain", "phone": "+8801611998877" },
    { "_id": "6a886a20e5d6aac97522c5b7", "name": "Shirin Akter", "phone": "+8801534561122" }
  ],
  "createdAt": "2026-08-21T15:09:21.268Z",
  "updatedAt": "2026-08-21T15:09:22.676Z"
}
```

## DELETE /conversations/{id}/participants/{userId}

Remove a member (admins only), or leave by passing your own id.

### Request

| Param | In | Type | Required |
|---|---|---|---|
| id | path | string | Yes |
| userId | path | string | Yes |

### Example

```
DELETE /api/conversations/6a886a21e5d6aac97522c5c2/participants/6a886a20e5d6aac97522c5b7
Authorization: Bearer <token>
```

### Response

```json
{
  "_id": "6a886a21e5d6aac97522c5c2",
  "type": "group",
  "name": "Purano Dhaka Bondhu Adda",
  "createdBy": "6a8869c0e5d6aac97522c455",
  "admins": ["6a8869c0e5d6aac97522c455", "6a8869c7e5d6aac97522c469"],
  "participants": [
    { "_id": "6a8869c0e5d6aac97522c455", "name": "Rafiq Islam", "phone": "+8801711223344" },
    { "_id": "6a8869c7e5d6aac97522c469", "name": "Nusrat Jahan", "phone": "+8801912345678" },
    { "_id": "6a8869d5e5d6aac97522c49a", "name": "Kamal Hossain", "phone": "+8801611998877" }
  ],
  "createdAt": "2026-08-21T15:09:21.268Z",
  "updatedAt": "2026-08-21T15:09:29.022Z"
}
```

## POST /conversations/{id}/admins

Promote a member to admin (admins only).

### Request

| Field | Type | Required |
|---|---|---|
| id (path) | string | Yes |
| userId | string | Yes |

### Example

```json
{ "userId": "6a8869c7e5d6aac97522c469" }
```

```
POST /api/conversations/6a886a21e5d6aac97522c5c2/admins
```

### Response

```json
{
  "_id": "6a886a21e5d6aac97522c5c2",
  "admins": ["6a8869c0e5d6aac97522c455", "6a8869c7e5d6aac97522c469"],
  "...": "rest of group object as above"
}
```

## PATCH /conversations/{id}

Rename a group (admins only).

### Request

| Field | Type | Required |
|---|---|---|
| id (path) | string | Yes |
| name | string | Yes |

### Example

```json
{ "name": "Purano Dhaka Bondhu Adda" }
```

```
PATCH /api/conversations/6a886a21e5d6aac97522c5c2
```

### Response

Group object with updated `name`.

### Errors

Non-admin tries to rename-`403 FORBIDDEN`:

```json
{
  "error": { "message": "Only admins can rename the group", "code": "FORBIDDEN" }
}
```

---

## Messages

## POST /messages

Send a message to a conversation (direct or group).

### Request

| Field | Type | Required |
|---|---|---|
| conversationId | string | Yes |
| text | string | Yes |

### Example

```json
{
  "conversationId": "6a8869d9e5d6aac97522c4b0",
  "text": "Assalamu alaikum, Nusrat! Kemon acho?"
}
```

### Response

```json
{
  "_id": "6a8869dbe5d6aac97522c4ba",
  "conversation": "6a8869d9e5d6aac97522c4b0",
  "sender": "6a8869c0e5d6aac97522c455",
  "text": "Assalamu alaikum, Nusrat! Kemon acho?",
  "createdAt": "2026-08-21T15:08:11.121Z"
}
```

---

## System

## GET /health

Health check (root path, not under `/api`).

### Request

No body. No path or query parameters.

### Example

```
GET /health
```

### Response

```json
{ "status": "ok" }
```

---

## Observed quirks / bugs

- **`message:new` does not match the REST message shape.** The socket sends `id` (not `_id`) and `createdAt` as epoch milliseconds (not an ISO string)-the example under [WebSocket](#websocket-socketio) above shows the REST shape and is inaccurate. Observed payload:
  ```json
  { "id": "6a88a942...", "conversation": "6a88a820...", "sender": "6a8869c7...", "text": "hi", "createdAt": 1787341122570 }
  ```
  Normalize before use, or `_id`-based dedup silently fails and messages duplicate against their REST copies. Handled by `normalizeSocketMessage` in `utils/messages.ts`.
- `POST /conversations/group` enforces **at least 3 total members**. `participantIds` excludes the creator, so it must contain 2+ ids; 1 id returns `400 VALIDATION_ERROR` with `"a group needs at least 3 members"`.
- **`conversation:updated` omits `updatedAt`, `createdAt` and `lastMessage`.** It sends only `_id`, `type`, `name`, `createdBy`, `admins` and `participants`-the documented example above previously showed timestamp fields the server does not send. A client that writes the payload straight into a cached conversation list therefore blanks the sidebar preview and puts `NaN` into any `updatedAt` sort. Merge with the existing copy instead (`normalizeSocketConversation` in `utils/conversation.ts`). Unlike `message:new`, the id field *is* `_id`.
- **A removed member still receives `conversation:updated`** for the group they were removed from, with themselves missing from `participants`-verified with four sockets. Leaving voluntarily behaves the same way.
- **The sender never receives their own `message:new`.** Verified with three sockets (two for the sender, one for the recipient): only the recipient is notified-on socket sends *and* REST sends, and not even in the sender's own second tab. A client must therefore update its own view from the send result, not from the socket.
- **`message:send` acks with `{ ok: true }` / `{ ok: false, error }`,** never the created message. `POST /messages` is the only way to obtain the canonical message in one round trip.
- **The server does not validate message text.** `message:send` with `text: ""`-or with the `text` field omitted entirely-acks `{ ok: true }` and broadcasts a `message:new` whose `text` is empty/undefined. Client-side validation is the only guard.
- `GET /users/search?q=+8801...` (leading `+`) returns `500`-unescaped regex bug. Search without `+`.
- `before` cursor on message history is inclusive, not exclusive.
- `GET /auth/me` with no token returns `400 NO_TOKEN`, not `401`.
