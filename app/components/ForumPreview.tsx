"use client";

import { memo } from "react";
import Link from "next/link";

interface ForumPost {
  id: string;
  title: string;
  reply_count: number;
}

interface ForumPreviewProps {
  forumPosts: ForumPost[];
  forumError: string | null;
}

function ForumPreview({ forumPosts, forumError }: ForumPreviewProps) {
  return (
    <div className="w-full">
      {forumError ? (
        <div className="text-red-500 text-sm font-mono py-2">{forumError}</div>
      ) : (
        <div>
          {forumPosts.map((post) => (
            <Link
              key={post.id}
              href={`/forum/${post.id}`}
              className="flex items-center justify-between px-4 py-3 border-b border-subtle hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm text-t2 truncate mr-4">
                {post.title}
              </span>
              <span className="text-xs text-t3 font-mono whitespace-nowrap">
                {post.reply_count} replies
              </span>
            </Link>
          ))}
        </div>
      )}
      <div className="pt-4 px-4">
        <Link
          href="/forum"
          className="text-t3 hover:text-t1 text-sm font-mono transition-colors"
        >
          Join Discussions →
        </Link>
      </div>
    </div>
  );
}

export default memo(ForumPreview);
