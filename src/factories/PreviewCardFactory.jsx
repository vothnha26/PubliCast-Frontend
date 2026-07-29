import React from "react"
import { SOCIAL_PLATFORM } from "@/constants/postComposer"
import { ThumbsUp, MessageSquare, Share2, Heart, Send, Repeat, MoreHorizontal } from "lucide-react"

/**
 * Facebook Feed Preview Card
 */
function FacebookPreviewCard({ draft }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 shadow-md text-slate-800 dark:text-slate-100 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-xl overflow-hidden ring-2 ring-indigo-500/20">
            ⚽
          </div>
          <div>
            <div className="font-extrabold text-sm flex items-center gap-1">
              Sát Nút
            </div>
            <div className="text-[11px] text-slate-400 font-medium">29 July · 🌐</div>
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-slate-400 cursor-pointer" />
      </div>

      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
        {draft.caption || "Nội dung bài viết sẽ hiển thị ở đây..."}
      </p>

      {draft.mediaUrls?.length > 0 && (
        <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 max-h-56 flex items-center justify-center">
          <img src={draft.mediaUrls[0]} alt="FB Preview" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center justify-around pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
        <button type="button" className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold">
          <ThumbsUp className="h-4 w-4" />
          <span>Thích</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold">
          <MessageSquare className="h-4 w-4" />
          <span>Bình luận</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold">
          <Share2 className="h-4 w-4" />
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>
  )
}

/**
 * Bluesky Feed Preview Card (Matches Wireframe 🦋)
 */
function BlueskyPreviewCard({ draft }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 shadow-md text-slate-800 dark:text-slate-100 space-y-3 font-sans">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
          🦋
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-extrabold text-sm">Sát Nút</span>
              <span className="text-xs text-slate-400 ml-1.5">@satnut.bsky.social</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">now</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1.5 whitespace-pre-wrap font-medium">
            {draft.caption || "Preview post on Bluesky network..."}
          </p>

          {draft.mediaUrls?.length > 0 && (
            <div className="mt-3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 max-h-56">
              <img src={draft.mediaUrls[0]} alt="Bluesky media" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-slate-500 text-xs">
            <MessageSquare className="h-4 w-4 cursor-pointer hover:text-sky-500" />
            <Repeat className="h-4 w-4 cursor-pointer hover:text-emerald-500" />
            <Heart className="h-4 w-4 cursor-pointer hover:text-rose-500" />
            <Share2 className="h-4 w-4 cursor-pointer hover:text-sky-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Threads Multi-Post Connected Thread Preview Card (Sleek SaaS Finish - Crisp Slate-300 Border)
 */
function ThreadsPreviewCard({ draft, onSetThreadActiveIndex }) {
  const threadsState = draft.networkCustom?.THREADS || {
    useTemplate: false,
    activeThreadIndex: 0,
    threadPosts: ["", ""],
  }
  const posts = threadsState.threadPosts?.length > 0 ? threadsState.threadPosts : ["", ""]
  const activeIndex = threadsState.activeThreadIndex || 0

  return (
    <div className="w-full flex gap-3 font-sans select-none">
      {/* Connected Thread Cards Container (Pure White Card with Crisp Slate Border & Shadow) */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 shadow-md text-slate-800 dark:text-slate-100 space-y-4">
        {posts.map((postText, index) => {
          const isLast = index === posts.length - 1
          const isActive = activeIndex === index

          return (
            <div
              key={index}
              onClick={() => onSetThreadActiveIndex && onSetThreadActiveIndex(index)}
              className={`relative flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer border ${
                isActive
                  ? "border-rose-500/80 bg-rose-500/5 dark:bg-rose-950/20 shadow-xs border-l-4 border-l-rose-500"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              {/* Left Column: Avatar + Connected Vertical Line */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
                  👤
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-slate-300 dark:bg-slate-700 min-h-[40px] my-1" />
                )}
              </div>

              {/* Right Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">satnut.bongda</span>
                    <span className="text-[11px] text-slate-400 font-medium">1h</span>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                {/* Badge 1/2 or 2/2 */}
                <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300 my-1 border border-slate-200 dark:border-slate-700">
                  {index + 1}/{posts.length}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {postText || (index === 0 ? draft.caption || "Thread post content..." : "Next thread post content...")}
                </p>

                {/* Interactive Icons */}
                <div className="flex items-center gap-4 mt-2.5 text-slate-500 text-xs">
                  <Heart className="h-4 w-4 cursor-pointer hover:text-rose-500" />
                  <MessageSquare className="h-4 w-4 cursor-pointer" />
                  <Repeat className="h-4 w-4 cursor-pointer hover:text-emerald-500" />
                  <Send className="h-4 w-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right Side Numbered Badges (Sleek High Contrast Buttons) */}
      <div className="flex flex-col gap-6 pt-3">
        {posts.map((_, idx) => {
          const isActive = activeIndex === idx
          return (
            <button
              key={idx}
              type="button"
              id={`btn-thread-badge-${idx + 1}`}
              onClick={() => onSetThreadActiveIndex && onSetThreadActiveIndex(idx)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer shadow-md ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-2 ring-rose-500 scale-110"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300 hover:scale-105"
              }`}
              title={`Chuyển sang soạn bài ${idx + 1}`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Instagram Preview Card
 */
function InstagramPreviewCard({ draft }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 shadow-md text-slate-800 dark:text-slate-100 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs">
              ⚽
            </div>
          </div>
          <span className="font-extrabold text-xs">satnut_official</span>
        </div>
        <MoreHorizontal className="h-4 w-4 text-slate-400" />
      </div>

      <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
        {draft.mediaUrls?.[0] ? (
          <img src={draft.mediaUrls[0]} alt="IG Media" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-400 text-xs font-semibold">Media Preview 📸</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 cursor-pointer hover:text-rose-500" />
          <MessageSquare className="h-5 w-5 cursor-pointer" />
          <Send className="h-5 w-5 cursor-pointer" />
        </div>
      </div>

      <p className="text-xs line-clamp-2">
        <span className="font-extrabold mr-1.5">satnut_official</span>
        {draft.caption || "Caption text preview here..."}
      </p>
    </div>
  )
}

/**
 * YouTube Preview Card
 */
function YouTubePreviewCard({ draft }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-3 shadow-md text-slate-800 dark:text-slate-100 space-y-2 font-sans">
      <div className="w-full h-44 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative">
        {draft.mediaUrls?.[0] ? (
          <img src={draft.mediaUrls[0]} alt="YT Thumbnail" className="w-full h-full object-cover" />
        ) : (
          <div className="text-red-500 text-3xl font-black">▶️</div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
          03:45
        </div>
      </div>
      <div className="flex items-start gap-2.5 pt-1">
        <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
          YT
        </div>
        <div>
          <h4 className="font-extrabold text-xs line-clamp-2 leading-tight">
            {draft.title || draft.youtubeOptions?.title || draft.caption || "Video Title Preview"}
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Sát Nút Channel • 0 views • Just now</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Factory Pattern Registry for Feed Previews
 */
export function renderPreviewCard(platformId, draft, postFormat, onSetThreadActiveIndex) {
  switch (platformId) {
    case SOCIAL_PLATFORM.THREADS:
      return <ThreadsPreviewCard draft={draft} onSetThreadActiveIndex={onSetThreadActiveIndex} />
    case SOCIAL_PLATFORM.BLUESKY:
      return <BlueskyPreviewCard draft={draft} />
    case SOCIAL_PLATFORM.INSTAGRAM:
      return <InstagramPreviewCard draft={draft} />
    case SOCIAL_PLATFORM.YOUTUBE:
      return <YouTubePreviewCard draft={draft} />
    case SOCIAL_PLATFORM.FACEBOOK:
    default:
      return <FacebookPreviewCard draft={draft} />
  }
}
