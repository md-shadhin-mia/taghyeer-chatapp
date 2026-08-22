"use client";

import { useState } from "react";
import { Avatar } from "@/components/layout/avatar";
import { useGroupManagement } from "@/hooks/use-group-management";
import { useUserSearch } from "@/hooks/use-user-search";
import { ApiError } from "@/services/api/error";
import type { GroupConversation } from "@/types/conversation";

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
  const [isAddingMember, setIsAddingMember] = useState(false);
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

  return (
    <div className="flex max-h-[70vh] w-full max-w-sm flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Group info</h2>
        <button
          onClick={onClose}
          aria-label="Close group info"
          className="text-muted hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {isRenaming ? (
        <form onSubmit={submitRename} className="flex gap-2">
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            className="flex-1 rounded-md border border-border-subtle bg-inset px-2 py-1.5 text-sm outline-none focus:border-accent-to"
          />
          <button
            type="submit"
            disabled={rename.isPending}
            className="rounded-md bg-accent-to px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            Save
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={conversation.name} size={40} />
            <span className="font-medium">{conversation.name}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setNameDraft(conversation.name);
                setIsRenaming(true);
              }}
              className="text-xs text-accent-to hover:underline"
            >
              Rename
            </button>
          )}
        </div>
      )}
      {rename.isError && (
        <p className="text-xs text-danger">
          {rename.error instanceof ApiError ? rename.error.message : "Couldn't rename group."}
        </p>
      )}

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          {conversation.participants.length} members
        </h3>
        <ul className="space-y-1">
          {conversation.participants.map((participant) => {
            const memberIsAdmin = conversation.admins.includes(participant._id);
            const isSelf = participant._id === currentUserId;
            return (
              <li
                key={participant._id}
                className="flex items-center gap-2 rounded-md px-1 py-1.5"
              >
                <Avatar name={participant.name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {participant.name} {isSelf && <span className="text-muted">(you)</span>}
                  </p>
                  {memberIsAdmin && <p className="text-xs text-muted">Admin</p>}
                </div>
                {isAdmin && !isSelf && (
                  <div className="flex flex-shrink-0 gap-2">
                    {!memberIsAdmin && (
                      <button
                        onClick={() => promoteAdmin.mutate(participant._id)}
                        disabled={promoteAdmin.isPending}
                        className="text-xs text-accent-to hover:underline disabled:opacity-50"
                      >
                        Make admin
                      </button>
                    )}
                    <button
                      onClick={() => removeMember.mutate(participant._id)}
                      disabled={removeMember.isPending}
                      className="text-xs text-danger hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {isAdmin &&
        (isAddingMember ? (
          <div className="space-y-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone…"
              className="w-full rounded-md border border-border-subtle bg-inset px-2 py-1.5 text-sm outline-none focus:border-accent-to"
            />
            {isSearching && <p className="text-xs text-muted">Searching…</p>}
            {!isSearching && query && candidates.length === 0 && (
              <p className="text-xs text-muted">No matching people found.</p>
            )}
            <ul className="max-h-40 space-y-1 overflow-y-auto">
              {candidates.map((candidate) => (
                <li key={candidate._id}>
                  <button
                    onClick={() =>
                      addMembers.mutate([candidate._id], {
                        onSuccess: () => {
                          setQuery("");
                          setIsAddingMember(false);
                        },
                      })
                    }
                    disabled={addMembers.isPending}
                    className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm transition-colors hover:bg-border-subtle disabled:opacity-50"
                  >
                    <Avatar name={candidate.name} size={28} />
                    {candidate.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsAddingMember(false)}
              className="text-xs text-muted hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingMember(true)}
            className="rounded-md border border-border-subtle px-3 py-2 text-sm transition-colors hover:bg-border-subtle"
          >
            + Add member
          </button>
        ))}

      <button
        onClick={() => leaveGroup.mutate(currentUserId, { onSuccess: onLeft })}
        disabled={leaveGroup.isPending}
        className="mt-2 rounded-md border border-danger/30 px-3 py-2 text-sm text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
      >
        Leave group
      </button>
    </div>
  );
}
