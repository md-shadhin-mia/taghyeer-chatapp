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

function ResultRow({
  candidate,
  selected,
  showCheckbox,
  disabled,
  onClick,
}: {
  candidate: UserSearchResult;
  selected?: boolean;
  showCheckbox?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={showCheckbox ? selected : undefined}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:opacity-50 ${
        selected
          ? "border-accent-to bg-accent-to/10"
          : "border-transparent bg-surface-elevated hover:border-border-subtle"
      }`}
    >
      <Avatar name={candidate.name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{candidate.name}</p>
        <p className="truncate text-xs text-muted">{candidate.phone}</p>
      </div>
      {showCheckbox && (
        <span
          aria-hidden
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border text-[11px] ${
            selected
              ? "border-accent-to bg-accent-to text-white"
              : "border-border-subtle bg-inset"
          }`}
        >
          {selected ? "✓" : ""}
        </span>
      )}
    </button>
  );
}

function SearchStatus({
  isLoading,
  query,
  count,
}: {
  isLoading: boolean;
  query: string;
  count: number;
}) {
  if (isLoading) return <p className="px-1 py-3 text-sm text-muted">Searching…</p>;
  if (!query)
    return <p className="px-1 py-3 text-sm text-muted">Search by name or phone number.</p>;
  if (count === 0)
    return <p className="px-1 py-3 text-sm text-muted">No matching people found.</p>;
  return null;
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
  const search = useUserSearch(token, currentUserId);
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

  function startDirect(candidate: UserSearchResult) {
    startConversation.mutate(candidate, {
      onSuccess: (result) => onConversationStarted(result.conversationId),
    });
  }

  function handleGroupSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Fewer than MIN_GROUP_PARTICIPANTS other people means the server would
    // reject the group (it enforces 3 total members) — fall back to a direct
    // chat with the one selected person instead.
    if (selected.length < MIN_GROUP_PARTICIPANTS) {
      const only = selected[0];
      if (!only) return;
      startDirect(only);
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
  const isGroupTab = activeTab === "group";

  const groupButtonLabel =
    selected.length === 1
      ? "Start direct chat"
      : createGroup.isPending
        ? "Creating group…"
        : "Create Group";
  const groupButtonDisabled =
    isBusy ||
    selected.length === 0 ||
    (selected.length >= MIN_GROUP_PARTICIPANTS && !groupName.trim());

  return (
    <Modal onClose={onClose}>
      <div className="relative flex max-h-[78vh] flex-col">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-muted transition-colors hover:text-foreground"
        >
          ✕
        </button>

        <h2 className="pr-10 text-xl font-semibold">Create New Conversation</h2>
        <p className="mb-4 mt-1 text-sm text-muted">
          Search by name or phone number to find someone to message.
        </p>

        <div
          role="tablist"
          aria-label="Conversation type"
          className="mb-4 flex rounded-full bg-inset p-1"
        >
          <button
            role="tab"
            aria-selected={!isGroupTab}
            onClick={() => onTabChange("direct")}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
              !isGroupTab ? "bg-accent-to text-white" : "text-muted hover:text-foreground"
            }`}
          >
            Direct Message
          </button>
          <button
            role="tab"
            aria-selected={isGroupTab}
            onClick={() => onTabChange("group")}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
              isGroupTab ? "bg-accent-to text-white" : "text-muted hover:text-foreground"
            }`}
          >
            Group Chat
          </button>
        </div>

        {isGroupTab && selected.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {selected.map((member) => (
              <button
                key={member._id}
                type="button"
                onClick={() => toggleSelected(member)}
                aria-label={`Remove ${member.name}`}
                className="flex items-center gap-1.5 rounded-full bg-surface-elevated py-1 pl-1 pr-2.5 text-xs transition-colors hover:bg-border-subtle"
              >
                <Avatar name={member.name} size={20} />
                {member.name} <span aria-hidden className="text-muted">✕</span>
              </button>
            ))}
          </div>
        )}

        <input
          autoFocus
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          placeholder="Search by name or phone…"
          aria-label="Search people"
          className="mb-3 w-full rounded-lg border border-border-subtle bg-inset px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-to"
        />

        {isGroupTab && (
          <div className="mb-3">
            <label htmlFor="group-name" className="mb-1.5 block text-sm font-medium">
              Group name
            </label>
            <input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Weekend Plans"
              disabled={selected.length < MIN_GROUP_PARTICIPANTS}
              className="w-full rounded-lg border border-border-subtle bg-inset px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-to disabled:opacity-50"
            />
            <p className="mt-1.5 text-xs text-muted">
              {selected.length === 1
                ? `A group needs at least ${MIN_GROUP_PARTICIPANTS} other people. Pick one more, or continue to start a direct chat with ${selected[0].name}.`
                : `A group needs at least ${MIN_GROUP_PARTICIPANTS} other people besides you.`}
            </p>
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
          <SearchStatus
            isLoading={search.isLoading}
            query={search.debouncedQuery}
            count={search.results.length}
          />
          {search.results.map((candidate) =>
            isGroupTab ? (
              <ResultRow
                key={candidate._id}
                candidate={candidate}
                selected={selected.some((item) => item._id === candidate._id)}
                showCheckbox
                onClick={() => toggleSelected(candidate)}
              />
            ) : (
              <ResultRow
                key={candidate._id}
                candidate={candidate}
                disabled={startConversation.isPending}
                onClick={() => startDirect(candidate)}
              />
            ),
          )}
        </div>

        {error && (
          <p role="alert" className="mt-2 text-xs text-danger">
            {error instanceof ApiError ? error.message : "Couldn't start the chat."}
          </p>
        )}

        {isGroupTab && (
          <form onSubmit={handleGroupSubmit} className="mt-4">
            <button
              type="submit"
              disabled={groupButtonDisabled}
              className="w-full rounded-lg bg-accent-to py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {groupButtonLabel}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
