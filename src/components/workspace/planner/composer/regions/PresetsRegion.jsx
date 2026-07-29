import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Settings, Bell, ChevronDown, ChevronUp, Edit2, HelpCircle, RotateCw, Copy, Globe } from "lucide-react"
import { PlatformIcon } from "@/components/shared/PlatformIcon"
import { SOCIAL_PLATFORM } from "@/constants/postComposer"

export default function PresetsRegion({
  selectedPlatforms = [],
  platformFormats = {},
  youtubeOptions = {},
  onUpdateYoutubeOption,
  presets = {},
  onUpdatePreset,
}) {
  const { t } = useTranslation()
  const [openAccordions, setOpenAccordions] = useState({
    global: false,
    notifications: false,
    bluesky: true,
    facebook: true,
    threads: true,
    youtube: true,
  })

  const [isAddingLanguage, setIsAddingLanguage] = useState(false)

  const autoPublish = presets.autoPublish ?? true
  const fbTitle = presets.facebookTitle ?? ""
  const threadsReplyPermission = presets.threadsReplyPermission ?? "Everyone"
  const blueskyLanguages = presets.blueskyLanguages ?? []

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleAddLanguage = (lang) => {
    if (!blueskyLanguages.includes(lang)) {
      onUpdatePreset("blueskyLanguages", [...blueskyLanguages, lang])
    }
    setIsAddingLanguage(false)
  }

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Global Presets Accordion */}
      <div className="border border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{t("composer.global_presets")}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto Publish Switch */}
            <div className="flex items-center gap-1.5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => onUpdatePreset("autoPublish", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{t("composer.auto_publish")}</span>
              <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
            </div>

            <button type="button" onClick={() => toggleAccordion("global")} className="p-1 cursor-pointer">
              {openAccordions.global ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {openAccordions.global && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs space-y-2">
            <p className="text-slate-600 dark:text-slate-400 font-medium">{t("composer.global_presets_desc")}</p>
          </div>
        )}
      </div>

      {/* 2. Notifications Presets Accordion */}
      <div className="border border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{t("composer.notification_presets")}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
              <span>{t("composer.edit")}</span>
            </button>

            <button type="button" onClick={() => toggleAccordion("notifications")} className="p-1 cursor-pointer">
              {openAccordions.notifications ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {openAccordions.notifications && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs text-slate-600 dark:text-slate-400 font-medium">
            {t("composer.notification_presets_desc")}
          </div>
        )}
      </div>

      {/* 3. Bluesky Presets Accordion */}
      {selectedPlatforms.includes(SOCIAL_PLATFORM.BLUESKY) && (
        <div className="border border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleAccordion("bluesky")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PlatformIcon platform={SOCIAL_PLATFORM.BLUESKY} size={20} />
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{t("composer.bluesky_presets")}</span>
            </div>
            {openAccordions.bluesky ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
          </button>

          {openAccordions.bluesky && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs flex items-center gap-3">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{t("composer.post_language")}</span>
              
              {/* Selected Languages Pills */}
              {blueskyLanguages.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1.5 rounded-full border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {lang}
                  <button
                    type="button"
                    onClick={() => onUpdatePreset("blueskyLanguages", blueskyLanguages.filter((l) => l !== lang))}
                    className="ml-1 text-sky-500 hover:text-sky-700 font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Dashed Add Languages Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAddingLanguage(!isAddingLanguage)}
                  className="px-3.5 py-1.5 rounded-xl border-2 border-dashed border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-600 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Globe className="h-3.5 w-3.5 text-slate-600" />
                  <span>{t("composer.add_language")}</span>
                </button>

                {isAddingLanguage && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg p-1.5 z-50 space-y-1">
                    <button
                      type="button"
                      onClick={() => handleAddLanguage("Tiếng Việt (vi)")}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                    >
                      🇻🇳 Tiếng Việt (vi)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLanguage("Tiếng Anh (en)")}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                    >
                      🇺🇸 Tiếng Anh (en)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Facebook Presets Accordion */}
      {selectedPlatforms.includes(SOCIAL_PLATFORM.FACEBOOK) && (
        <div className="border border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleAccordion("facebook")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PlatformIcon platform={SOCIAL_PLATFORM.FACEBOOK} size={20} />
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{t("composer.facebook_presets")}</span>
            </div>
            {openAccordions.facebook ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
          </button>

          {openAccordions.facebook && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
              <input
                type="text"
                placeholder={t("composer.facebook_title_placeholder")}
                value={fbTitle}
                onChange={(e) => onUpdatePreset("facebookTitle", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs font-semibold shadow-xs"
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Threads Presets Accordion */}
      {selectedPlatforms.includes(SOCIAL_PLATFORM.THREADS) && (
        <div className="border border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleAccordion("threads")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PlatformIcon platform={SOCIAL_PLATFORM.THREADS} size={20} />
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{t("composer.threads_presets")}</span>
            </div>
            {openAccordions.threads ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
          </button>

          {openAccordions.threads && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
              <div className="relative pt-1.5">
                <label className="absolute -top-1 left-3 bg-white dark:bg-slate-900 px-1.5 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 z-10 rounded">
                  {t("composer.who_can_reply")}
                </label>
                <select
                  value={threadsReplyPermission}
                  onChange={(e) => onUpdatePreset("threadsReplyPermission", e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <option value="Everyone">{t("composer.reply_everyone")}</option>
                  <option value="Profiles you follow">{t("composer.reply_follows")}</option>
                  <option value="Mentioned only">{t("composer.reply_mentioned")}</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. YouTube Presets Accordion */}
      {selectedPlatforms.includes(SOCIAL_PLATFORM.YOUTUBE) && (
        <div className="border border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleAccordion("youtube")}
            className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PlatformIcon platform={SOCIAL_PLATFORM.YOUTUBE} size={20} />
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{t("composer.youtube_presets")}</span>
            </div>
            {openAccordions.youtube ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
          </button>

          {openAccordions.youtube && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Row 1 - Col 1: Tiêu đề Video hoặc Shorts */}
                <div>
                  <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                    {t("composer.youtube_video_title")}
                  </label>
                  <input
                    id="input-youtube-title"
                    type="text"
                    maxLength={100}
                    placeholder={t("composer.youtube_title_placeholder")}
                    value={youtubeOptions.title || ""}
                    onChange={(e) => onUpdateYoutubeOption("title", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 font-medium shadow-xs"
                  />
                  <div className="text-[11px] text-slate-500 text-right mt-1 font-bold">
                    {(youtubeOptions.title || "").length} / 100
                  </div>
                </div>

                {/* Row 1 - Col 2: Cấu hình đối tượng người xem */}
                <div>
                  <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                    {t("composer.youtube_audience")}
                  </label>
                  <select
                    value={youtubeOptions.audience || "NOT_MADE_FOR_KIDS"}
                    onChange={(e) => onUpdateYoutubeOption("audience", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer font-medium shadow-xs"
                  >
                    <option value="NOT_MADE_FOR_KIDS">{t("composer.not_made_for_kids")}</option>
                    <option value="MADE_FOR_KIDS">{t("composer.made_for_kids")}</option>
                  </select>
                </div>

                {/* Row 2 - Col 1: Quyền riêng tư */}
                <div>
                  <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                    {t("composer.youtube_privacy")}
                  </label>
                  <select
                    value={youtubeOptions.privacyStatus || "PUBLIC"}
                    onChange={(e) => onUpdateYoutubeOption("privacyStatus", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer font-medium shadow-xs"
                  >
                    <option value="PUBLIC">{t("composer.privacy_public")}</option>
                    <option value="UNLISTED">{t("composer.privacy_unlisted")}</option>
                    <option value="PRIVATE">{t("composer.privacy_private")}</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-tight font-medium">
                    {t("composer.youtube_privacy_hint")}
                  </p>
                </div>

                {/* Row 2 - Col 2: Danh mục nội dung */}
                <div>
                  <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                    {t("composer.youtube_category")}
                  </label>
                  <select
                    value={youtubeOptions.category || "Science & Technology"}
                    onChange={(e) => onUpdateYoutubeOption("category", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer font-medium shadow-xs"
                  >
                    <option value="Science & Technology">Khoa học & Công nghệ</option>
                    <option value="Entertainment">Giải trí</option>
                    <option value="Education">Giáo dục</option>
                    <option value="Music">Âm nhạc</option>
                    <option value="Gaming">Trò chơi (Gaming)</option>
                    <option value="People & Blogs">Mọi người & Blog</option>
                  </select>
                </div>

                {/* Row 3 - Col 1: Thêm vào danh sách phát */}
                <div>
                  <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                    {t("composer.youtube_playlist")}
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={youtubeOptions.playlistId || ""}
                      onChange={(e) => onUpdateYoutubeOption("playlistId", e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer font-medium shadow-xs"
                    >
                      <option value="">{t("composer.select_playlist")}</option>
                      <option value="pl_1">Danh sách phát mặc định</option>
                      <option value="pl_2">Video Công nghệ 2026</option>
                    </select>

                    <button
                      type="button"
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer shadow-xs"
                      title="Làm mới danh sách phát"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Row 3 - Col 2: Thẻ từ khóa (Tags) */}
                <div>
                  <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                    {t("composer.youtube_tags")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={t("composer.tags_placeholder")}
                      value={youtubeOptions.tags || ""}
                      onChange={(e) => onUpdateYoutubeOption("tags", e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 font-medium shadow-xs"
                    />

                    <button
                      type="button"
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer shadow-xs"
                      title="Sao chép thẻ từ khóa"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
