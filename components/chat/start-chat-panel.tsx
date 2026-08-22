"use client";

import { useState } from "react";
import { Avatar } from "@/components/layout/avatar";
import { Modal } from "@/components/ui/modal";
import { useUserSearch } from "@/hooks/use-user-search";
import { useStartConversation } from "@/hooks/use-start-conversation";
import { useCreateGroup } from "@/hooks/use-create-group";
import { MIN_GROUP_PARTICIPANTS } from "@/services/api/conversations";
import { ApiError } from "@/services/api/error";
import type { UserSearchResult } from "@/types/api";

export type NewChatTab = "direct" | "group";

function UserResultList({
  results,
  isLoading,
  query,
  renderAction,
}: {
  results: UserSearchResult[];
  isLoading: boolean;
  query: string;
  renderAction: (candidate: UserSearchResult) => React.ReactNode;
}) {
  if (isLoading) {
    return <p className="px-1 py-3 text-sm text-muted">Searching…</p>;
  }
  if (!query) {
    return <p className="px-1 py-3 text-sm text-muted">Search by name or phone number.</p>;
  }
  if (results.length === 0) {
    return <p className="px-1 py-3 text-sm text-muted">No matching people found.</p>;
  }
  return (
    <ul className="max-h-56 space-y-1 overflow-y-auto">
      {results.map((candidate) => (
        <li key={candidate._id}>{renderAction(candidate)}</li>
      ))}
    </ul>
  );
}

export function StartChatPanel({
  token,
  currentUserId,
  activeTab,
  onTabChange,
  onClose,
  onConversationStarted,
}: {
  token: string | null;
  currentUserId: string;
  activeTab: NewChatTab;
  onTabChange: (tab: NewChatTab) => void;
  onClose: () => void;
  onConversationStarted: (conversationId: string) => void;
}) {
  const directSearch = useUserSearch(token, currentUserId);
  const groupSearch = useUserSearch(token, currentUserId);
  const startConversation = useStartConversation(token);
  const createGroup = useCreateGroup(token);

  const [selected, setSelected] = useState<UserSearchResult[]>([]);
  const [groupName, setGroupName] = useState("");

  function toggleSelected(candidate: UserSearchResult) {
    setSelected((current) =>
      current.some((item) => item._id === candidate._id)
        ? current.filter((item) => item._id !== candidate._id)
        : [...current, candidate],
    );
  }

  function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();

    // Fewer than MIN_GROUP_PARTICIPANTS other people means the server would
    // reject the group (it enforces 3 total members) — start a direct chat
    // with that one person instead.
    if (selected.length < MIN_GROUP_PARTICIPANTS) {
      const only = selected[0];
      if (!only) return;
      startConversation.mutate(only, {
        onSuccess: (result) => onConversationStarted(result.conversationId),
      });
      return;
    }

    const trimmedName = groupName.trim();
    if (!trimmedName) return;

    createGroup.mutate(
      { name: trimmedName, participantIds: selected.map((s) => s._id) },
      { onSuccess: (group) => onConversationStarted(group._id) },
    );
  }

  const isBusy = startConversation.isPending || createGroup.isPending;
  const error = startConversation.error ?? createGroup.error;

  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[75vh] flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="start-chat-heading" className="text-base font-semibold">
            New chat
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-md bg-inset p-1">
          <button
            onClick={() => onTabChange("direct")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              activeTab === "direct" ? "bg-accent-to text-white" : "text-muted hover:text-foreground"
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => onTabChange("group")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              activeTab === "group" ? "bg-accent-to text-white" : "text-muted hover:text-foreground"
            }`}
          >
            Group
          </button>
        </div>

        {activeTab === "direct" ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <input
              autoFocus
              value={directSearch.query}
              onChange={(e) => directSearch.setQuery(e.target.value)}
              placeholder="Search by name or phone…"
              className="mb-2 w-full rounded-md border border-border-subtle bg-inset px-3 py-2 text-sm outline-none focus:border-accent-to"
            />
            <UserResultList
              results={directSearch.results}
              isLoading={directSearch.isLoading}
              query={directSearch.debouncedQuery}
              renderAction={(candidate) => (
                <button
                  onClick={() =>
                    startConversation.mutate(candidate, {
                      onSuccess: (result) => onConversationStarted(result.conversationId),
                    })
                  }
                  disabled={startConversation.isPending}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-border-subtle disabled:opacity-50"
                >
                  <Avatar name={candidate.name} size={32} />
                  <span className="min-w-0 flex-1 truncate">{candidate.name}</span>
                </button>
              )}
            />
          </div>
        ) : (
          <form onSubmit={handleCreateGroup} className="flex min-h-0 flex-1 flex-col gap-3">
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.map((member) => (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => toggleSelected(member)}
                    className="flex items-center gap-1 rounded-full bg-inset px-2 py-1 text-xs"
                  >
                    {member.name} <span aria-hidden>✕</span>
                  </button>
                ))}
              </div>
            )}

            {selected.length >= MIN_GROUP_PARTICIPANTS && (
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full rounded-md border border-border-subtle bg-inset px-3 py-2 text-sm outline-none focus:border-accent-to"
              />
            )}

            <input
              value={groupSearch.query}
              onChange={(e) => groupSearch.setQuery(e.target.value)}
              placeholder="Add people…"
              className="w-full rounded-md border border-border-subtle bg-inset px-3 py-2 text-sm outline-none focus:border-accent-to"
            />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <UserResultList
                results={groupSearch.results}
                isLoading={groupSearch.isLoading}
                query={groupSearch.debouncedQuery}
                renderAction={(candidate) => {
                  const isSelected = selected.some((item) => item._id === candidate._id);
                  return (
                    <button
                      type="button"
                      onClick={() => toggleSelected(candidate)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-border-subtle ${
                        isSelected ? "bg-border-subtle" : ""
                      }`}
                    >
                      <Avatar name={candidate.name} size={32} />
                      <span className="min-w-0 flex-1 truncate">{candidate.name}</span>
                      {isSelected && <span aria-hidden>✓</span>}
                    </button>
                  );
                }}
              />
            </div>

            {error && (
              <p className="text-xs text-danger">
                {error instanceof ApiError ? error.message : "Couldn't start the chat."}
              </p>
            )}

            <button
              type="submit"
              disabled={
                isBusy ||
                selected.length === 0 ||
                (selected.length >= MIN_GROUP_PARTICIPANTS && !groupName.trim())
              }
              className="rounded-md bg-accent-to px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selected.length >= MIN_GROUP_PARTICIPANTS ? "Create group" : "Start chat"}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
