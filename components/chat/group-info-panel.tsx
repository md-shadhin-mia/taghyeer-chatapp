"use client";

import { useState } from "react";
import { Avatar } from "@/components/layout/avatar";
import { useGroupManagement } from "@/hooks/use-group-management";
import { useUserSearch } from "@/hooks/use-user-search";
import { ApiError } from "@/services/api/error";
import type { GroupConversation } from "@/types/conversation";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-dim">
      {children}
    </p>
  );
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function GroupInfoPanel({
  token,
  conversation,
  currentUserId,
  onClose,
  onLeft,
}: {
  token: string | null;
  conversation: GroupConversation;
  currentUserId: string;
  onClose: () => void;
  onLeft: () => void;
}) {
  const isAdmin = conversation.admins.includes(currentUserId);
  const { addMembers, removeMember, promoteAdmin, rename, leaveGroup } = useGroupManagement(
    token,
    conversation._id,
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(conversation.name);
  const { query, setQuery, results, isLoading: isSearching } = useUserSearch(
    token,
    currentUserId,
  );

  const existingIds = new Set(conversation.participants.map((p) => p._id));
  const candidates = results.filter((candidate) => !existingIds.has(candidate._id));

  function submitRename(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === conversation.name) {
      setIsRenaming(false);
      return;
    }
    rename.mutate(trimmed, { onSuccess: () => setIsRenaming(false) });
  }

  const mutationError =
    (rename.isError && errorText(rename.error, "Couldn't rename the group.")) ||
    (addMembers.isError && errorText(addMembers.error, "Couldn't add that member.")) ||
    (removeMember.isError && errorText(removeMember.error, "Couldn't remove that member.")) ||
    (promoteAdmin.isError && errorText(promoteAdmin.error, "Couldn't promote that member.")) ||
    (leaveGroup.isError && errorText(leaveGroup.error, "Couldn't leave the group.")) ||
    null;

  return (
    <div className="relative flex max-h-[75vh] flex-col overflow-hidden">
      <button
        onClick={onClose}
        aria-label="Close group info"
        className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-muted transition-colors hover:text-foreground"
      >
        ✕
      </button>

      {/* Group identity, centered like the reference design. */}
      <div className="flex flex-shrink-0 flex-col items-center pb-5 pt-2 text-center">
        <Avatar name={conversation.name} size={64} />
        {isRenaming ? (
          <form onSubmit={submitRename} className="mt-3 flex w-full max-w-xs gap-2">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              aria-label="Group name"
              className="min-w-0 flex-1 rounded-lg border border-border-subtle bg-inset px-3 py-1.5 text-sm outline-none focus:border-accent-to"
            />
            <button
              type="submit"
              disabled={rename.isPending}
              className="rounded-lg bg-accent-to px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsRenaming(false)}
              className="text-xs text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">{conversation.name}</h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setNameDraft(conversation.name);
                  setIsRenaming(true);
                }}
                className="text-sm font-medium text-accent-hover hover:underline"
              >
                Rename
              </button>
            )}
          </div>
        )}
        <p className="mt-1 text-sm text-muted">
          {conversation.participants.length} members{isAdmin && " · You're an admin"}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col pb-4">
        <SectionLabel>Members</SectionLabel>
        <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {conversation.participants.map((participant) => {
            const memberIsAdmin = conversation.admins.includes(participant._id);
            const isSelf = participant._id === currentUserId;
            return (
              <li key={participant._id} className="flex items-center gap-3">
                <Avatar name={participant.name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {participant.name}{" "}
                    {isSelf && <span className="font-normal text-muted">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted">{participant.phone}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  {memberIsAdmin ? (
                    <span className="rounded-full bg-accent-to/15 px-2.5 py-0.5 text-xs font-medium text-accent-hover">
                      Admin
                    </span>
                  ) : (
                    isAdmin && (
                      <button
                        onClick={() => promoteAdmin.mutate(participant._id)}
                        disabled={promoteAdmin.isPending}
                        className="text-xs font-medium text-accent-hover hover:underline disabled:opacity-50"
                      >
                        Make admin
                      </button>
                    )
                  )}
                  {isAdmin && !isSelf && (
                    <button
                      onClick={() => removeMember.mutate(participant._id)}
                      disabled={removeMember.isPending}
                      className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {isAdmin && (
        <div className="flex-shrink-0 pb-2">
          <SectionLabel>Add members</SectionLabel>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone number"
            aria-label="Search people to add"
            className="w-full rounded-lg border border-border-subtle bg-inset px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-to"
          />
          {isSearching && <p className="px-1 pt-2 text-xs text-muted">Searching…</p>}
          {!isSearching && query && candidates.length === 0 && (
            <p className="px-1 pt-2 text-xs text-muted">No matching people found.</p>
          )}
          {candidates.length > 0 && (
            <ul className="mt-2 max-h-44 space-y-1.5 overflow-y-auto">
              {candidates.map((candidate) => (
                <li key={candidate._id}>
                  <button
                    onClick={() =>
                      addMembers.mutate([candidate._id], { onSuccess: () => setQuery("") })
                    }
                    disabled={addMembers.isPending}
                    className="flex w-full items-center gap-3 rounded-lg bg-surface-elevated px-3 py-2 text-left transition-colors hover:bg-border-subtle disabled:opacity-50"
                  >
                    <Avatar name={candidate.name} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {candidate.name}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {candidate.phone}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-accent-hover">Add</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mutationError && (
        <p role="alert" className="pb-2 text-xs text-danger">
          {mutationError}
        </p>
      )}

      <div className="mt-2 flex-shrink-0 border-t border-border-subtle pt-4">
        <button
          onClick={() => leaveGroup.mutate(currentUserId, { onSuccess: onLeft })}
          disabled={leaveGroup.isPending}
          className="text-sm font-medium text-danger hover:underline disabled:opacity-50"
        >
          {leaveGroup.isPending ? "Leaving…" : "Leave group"}
        </button>
      </div>
    </div>
  );
}
