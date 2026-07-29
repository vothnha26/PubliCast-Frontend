import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { X, Smile } from "lucide-react"

export default function PostNotesPanel({ onClose }) {
  const { t } = useTranslation()
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleAddNote = () => {
    if (!newNote.trim()) return
    const noteObj = {
      id: Date.now(),
      author: "Nhã Võ",
      initials: "NV",
      avatarBg: "bg-indigo-600",
      content: newNote.trim(),
      createdAt: "Just now",
    }
    setNotes([...notes, noteObj])
    setNewNote("")
  }

  const handleAddEmoji = (emoji) => {
    setNewNote((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className="w-[520px] bg-white dark:bg-slate-950 flex flex-col h-full shrink-0 border-l border-slate-300 dark:border-slate-800 font-sans select-none animate-fade-in">
      
      {/* Panel Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 shrink-0">
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
          {t("composer.post_notes")}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={t("composer.close")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Panel Body / Notes List */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center items-center bg-white dark:bg-slate-950">
        {notes.length === 0 ? (
          /* Empty State Illustration */
          <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto">
            
            {/* Graphic Illustration Chat Bubbles */}
            <div className="relative w-48 h-36 flex flex-col justify-center items-center">
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900/60 rounded-full scale-90 -z-10" />
              
              {/* Bubble A (Top) */}
              <div className="flex items-center gap-2 translate-x-2 -translate-y-2 animate-bounce-slight">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  A
                </div>
                <div className="w-32 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs" />
              </div>

              {/* Bubble B (Middle) */}
              <div className="flex items-center gap-2 -translate-x-4 my-1">
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  B
                </div>
                <div className="w-32 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 flex items-center shadow-2xs">
                  <div className="w-16 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              </div>

              {/* Bubble A (Bottom) */}
              <div className="flex items-center gap-2 translate-x-2 translate-y-2">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  A
                </div>
                <div className="w-32 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 flex items-center gap-1.5 shadow-2xs">
                  <div className="w-10 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="w-12 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
            </div>

            {/* Text Label */}
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {t("composer.no_notes")}
            </p>
          </div>
        ) : (
          /* Populated Notes List */
          <div className="w-full space-y-3 my-auto">
            {notes.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className={`w-8 h-8 rounded-full ${n.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shrink-0`}>
                  {n.initials}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{n.author}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{n.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {n.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel Footer / Add Note Input Box */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xs space-y-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={t("composer.add_note_placeholder")}
            rows={3}
            className="w-full bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none text-xs font-medium"
          />

          <div className="flex items-center justify-between pt-1 relative">
            {/* Emoji Picker Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Add Emoji"
              >
                <Smile className="h-4 w-4" />
              </button>

              {showEmojiPicker && (
                <div className="absolute left-0 bottom-full mb-2 p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xl flex gap-1 z-50 animate-scale-in">
                  {["😊", "👍", "💡", "📝", "✅", "🔥"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handleAddEmoji(em)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Save Note Button */}
            <button
              type="button"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className={`px-5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                newNote.trim()
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs hover:bg-slate-800"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              }`}
            >
              {t("composer.save")}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
