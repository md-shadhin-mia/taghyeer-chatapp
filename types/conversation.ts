export interface Participant {
  _id: string;
  name: string;
  phone: string;
}

export interface LastMessage {
  text: string;
  sender: string;
  createdAt: string;
}

export interface DirectConversation {
  _id: string;
  type: "direct";
  participant: Participant;
  lastMessage?: LastMessage;
  updatedAt: string;
}

export interface GroupConversation {
  _id: string;
  type: "group";
  name: string;
  createdBy: string;
  admins: string[];
  participants: Participant[];
  lastMessage?: LastMessage;
  updatedAt: string;
}

export type Conversation = DirectConversation | GroupConversation;

/**
 * The realtime `conversation:updated` payload. Verified against the live server:
 * it carries `_id`, `type`, `name`, `createdBy`, `admins` and `participants` —
 * and **omits `updatedAt`, `createdAt` and `lastMessage` entirely**, contrary to
 * API.md's example. Every field is optional here so a shape change degrades to a
 * refetch instead of writing `undefined` into the conversations cache.
 */
export interface SocketConversationPayload {
  _id?: string;
  id?: string;
  type?: string;
  name?: string;
  createdBy?: string;
  admins?: string[];
  participants?: Participant[];
  lastMessage?: LastMessage;
  createdAt?: string | number;
  updatedAt?: string | number;
}
