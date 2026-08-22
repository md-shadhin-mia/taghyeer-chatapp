"use client";

export function NotificationsPanel({
  conversations,
  onSelectConversation,
  onClose,
}: {
  conversations: Array<{ _id: string; participants: string[]; name?: string }>;
  onSelectConversation: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="max-w-md space-y-1">
      {conversations.map((conversation) => (
        <div
          key={conversation._id}
          onClick={() => onSelectConversation(conversation._id)}
          className="flex items-center rounded-border px-3 py-2 cursor-pointer hover:bg-border-subtle transition-colors"
        >
          {conversation.participants.length > 2 ? (
            <span className="w-2 h-2 rounded-full bg-accent-to mr-2"></span>
            {conversation.name || "Group"}
          ) : (
            <Avatar name={conversation.participants[0] || "You"} className="w-3 h-3 mr-2" />
            {conversation.participants.length > 0 ? conversation.participants[0] : "No one"}
          )}
        </div>
      ))}
      <button onClick={onClose} className="mt-2 w-full text-xs text-muted rounded-border px-3 py-2 border-border-subtle hover:bg-border-subtle transition-colors">
        Cancel
      </button>
    </div>
  );
}