"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser, useComments, useStore } from "@/lib/store";

export function TaskComments({ taskId }: { taskId: string }) {
  const comments = useComments(taskId);
  const users = useStore((s) => s.users);
  const currentUser = useCurrentUser();
  const addComment = useStore((s) => s.addComment);
  const deleteComment = useStore((s) => s.deleteComment);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addComment(taskId, trimmed);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {comments.map((c) => {
          const author = users.find((u) => u.id === c.userId);
          return (
            <li key={c.id} className="flex gap-2">
              <UserAvatar user={author} size="sm" />
              <div className="min-w-0 flex-1 rounded-md border border-border bg-surface/50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{author?.name ?? "Unknown"}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
                {c.userId === currentUser.id && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="mt-1 text-[11px] text-muted-foreground hover:text-destructive"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
        {comments.length === 0 && (
          <li className="text-xs text-muted-foreground">No comments yet — start the thread.</li>
        )}
      </ul>

      <div className="flex flex-col gap-2 rounded-md border border-border bg-surface/40 p-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Write a comment — ⌘↵ to send"
          className="min-h-[60px] resize-none border-none bg-transparent shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-end">
          <Button size="sm" onClick={submit} disabled={!draft.trim()}>
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
