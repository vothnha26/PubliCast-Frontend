import { useState, useEffect, useMemo, useCallback } from "react"
import { PlatformStrategyRegistry } from "@/strategies/PlatformStrategies"
import { ErrorRegistry } from "@/services/ErrorRegistry"
import { POST_TEMPLATES, NETWORK_TAB_TEMPLATE, POST_FORMAT_TO_POST_TYPE, SOCIAL_PLATFORM } from "@/constants/postComposer"
import { POST_CREATE_STATUS, POST_TYPE } from "@/constants/post"
import { postService } from "@/services/postService"
import { toast } from "sonner"

// postFormat "POST" has no direct Prisma PostType match — it means "a
// regular feed post" on whichever platform, which Post.type instead
// expresses as the media kind actually attached (see POST_FORMAT_TO_POST_TYPE
// for the formats that do map 1:1).
const mapPostFormatToPostType = (postFormat, mediaUrls) => {
  const direct = POST_FORMAT_TO_POST_TYPE[postFormat]
  if (direct) return direct
  if (mediaUrls.length === 0) return POST_TYPE.TEXT
  const firstExt = mediaUrls[0].split("?")[0].split(".").pop()?.toLowerCase()
  const videoExts = ["mp4", "mov", "webm", "avi", "mkv"]
  return videoExts.includes(firstExt) ? POST_TYPE.VIDEO : POST_TYPE.IMAGE
}

export function usePostComposerFacade(initialScheduledAt, brandId, onSuccess, onClose) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([SOCIAL_PLATFORM.THREADS, SOCIAL_PLATFORM.YOUTUBE])
  const [postFormat, setPostFormat] = useState("POST")
  const [activePreviewPlatform, setActivePreviewPlatform] = useState(SOCIAL_PLATFORM.THREADS)
  const [deviceMode, setDeviceMode] = useState("mobile")
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Raw File objects selected but not yet uploaded, keyed by their blob:
  // preview URL (see addPendingFiles) — see PlatformStrategies'
  // validateMediaFiles, which checks these against platformLimits client-side
  // (File.size/name) so a bad file blocks Submit before ever reaching
  // Cloudinary. Upload only actually happens inside handleSubmit.
  const [pendingFiles, setPendingFiles] = useState(new Map())
  const [platformLimits, setPlatformLimits] = useState([])

  useEffect(() => {
    postService.getPlatformLimits()
      .then(setPlatformLimits)
      .catch((err) => console.error("[usePostComposerFacade] Failed to load platform limits:", err))
  }, [])

  // Edit by network state
  const [isEditByNetwork, setIsEditByNetwork] = useState(true)
  const [activeNetworkTab, setActiveNetworkTab] = useState(NETWORK_TAB_TEMPLATE)

  // Draft state
  const [draft, setDraft] = useState({
    title: "",
    caption: "",
    // Local blob: URLs for preview until handleSubmit uploads pendingFiles
    // for real and replaces them with Cloudinary URLs just before createPost.
    mediaUrls: [],
    // Set by handleSubmit after the real upload — real size/duration read
    // from POST /v2/posts/upload's response (Cloudinary metadata) for the
    // most recently uploaded file, sent as options.videoSizeMb/videoDuration
    // so backend's validationFacade checks real numbers instead of trusting
    // an unset/absent client claim (see post.service.js _preparePostData,
    // which previously always got null here since nothing populated it).
    mediaMeta: { sizeMb: null, duration: null },
    customThumbnail: null,
    scheduledAt: initialScheduledAt || new Date().toISOString(),
    youtubeOptions: {
      title: "",
      privacyStatus: "PUBLIC",
      category: "Science & Technology",
      isShort: true,
    },
    instagramOptions: {
      shareToFeed: true,
    },
    presets: {
      autoPublish: true,
      facebookTitle: "",
      threadsReplyPermission: "Everyone",
      blueskyLanguages: [],
    },
    // Custom content per network when isEditByNetwork is active
    networkCustom: {
      FACEBOOK: {
        useTemplate: true,
        caption: "",
        mediaUrls: [],
      },
      INSTAGRAM: {
        useTemplate: true,
        caption: "",
        mediaUrls: [],
      },
      YOUTUBE: {
        useTemplate: true,
        caption: "",
        mediaUrls: [],
      },
      TIKTOK: {
        useTemplate: true,
        caption: "",
        mediaUrls: [],
      },
      BLUESKY: {
        useTemplate: true,
        caption: "",
        mediaUrls: [],
      },
      THREADS: {
        useTemplate: false,
        activeThreadIndex: 0,
        // Starts with exactly 1 post — addThreadPost is what grows this list
        // when the user actually clicks "+", not a pre-seeded mock thread.
        threadPosts: [""],
        mediaUrls: [],
      },
    },
  })

  // Approval workflow state
  const [reviewers, setReviewers] = useState([
    { id: "rev_1", name: "Minh Tran", role: "Manager", avatar: "MT" },
  ])

  // Update draft helper
  const updateDraft = useCallback((field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateYoutubeOption = useCallback((field, value) => {
    setDraft((prev) => ({
      ...prev,
      youtubeOptions: { ...prev.youtubeOptions, [field]: value },
    }))
  }, [])

  // Adds files chosen in the composer to draft.mediaUrls OR targetPlatform's
  // networkCustom.mediaUrls (as local blob: URLs, for instant preview) and pendingFiles.
  const addPendingFiles = useCallback((files, targetPlatform) => {
    const blobUrls = files.map((file) => URL.createObjectURL(file))
    setDraft((prev) => {
      if (targetPlatform && targetPlatform !== NETWORK_TAB_TEMPLATE) {
        const currentNet = prev.networkCustom[targetPlatform] || { useTemplate: true, caption: "", mediaUrls: [] }
        return {
          ...prev,
          networkCustom: {
            ...prev.networkCustom,
            [targetPlatform]: {
              ...currentNet,
              mediaUrls: [...(currentNet.mediaUrls || []), ...blobUrls],
            },
          },
        }
      } else {
        return { ...prev, mediaUrls: [...prev.mediaUrls, ...blobUrls] }
      }
    })
    setPendingFiles((prev) => {
      const next = new Map(prev)
      files.forEach((file, i) => next.set(blobUrls[i], file))
      return next
    })
  }, [])

  // Removes file from draft.mediaUrls OR targetPlatform's networkCustom.mediaUrls
  const removePendingFile = useCallback((index, targetPlatform) => {
    setDraft((prev) => {
      let removedUrl = null
      if (targetPlatform && targetPlatform !== NETWORK_TAB_TEMPLATE) {
        const currentNet = prev.networkCustom[targetPlatform] || { useTemplate: true, caption: "", mediaUrls: [] }
        const netMedia = currentNet.mediaUrls || []
        removedUrl = netMedia[index]
        const updatedMedia = netMedia.filter((_, i) => i !== index)
        if (removedUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(removedUrl)
          setPendingFiles((prevFiles) => {
            const next = new Map(prevFiles)
            next.delete(removedUrl)
            return next
          })
        }
        return {
          ...prev,
          networkCustom: {
            ...prev.networkCustom,
            [targetPlatform]: {
              ...currentNet,
              mediaUrls: updatedMedia,
            },
          },
        }
      } else {
        removedUrl = prev.mediaUrls[index]
        if (removedUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(removedUrl)
          setPendingFiles((prevFiles) => {
            const next = new Map(prevFiles)
            next.delete(removedUrl)
            return next
          })
        }
        return { ...prev, mediaUrls: prev.mediaUrls.filter((_, i) => i !== index) }
      }
    })
  }, [])

  const updatePreset = useCallback((field, value) => {
    setDraft((prev) => ({
      ...prev,
      presets: { ...prev.presets, [field]: value },
    }))
  }, [])

  // Toggle edit by network
  const toggleEditByNetwork = useCallback(() => {
    setIsEditByNetwork((prev) => !prev)
  }, [])

  // Network tab selection
  const setNetworkTab = useCallback((tabId) => {
    setActiveNetworkTab(tabId)
    if (tabId !== NETWORK_TAB_TEMPLATE) {
      setActivePreviewPlatform(tabId)
    }
  }, [])

  // Update custom caption for a specific (non-Threads) network
  const updateNetworkCaption = useCallback((platformId, value) => {
    setDraft((prev) => {
      const currentNet = prev.networkCustom[platformId] || { useTemplate: true, caption: "", mediaUrls: [] }
      return {
        ...prev,
        networkCustom: {
          ...prev.networkCustom,
          [platformId]: { ...currentNet, caption: value },
        },
      }
    })
  }, [])

  // Update custom mediaUrls array for a specific network
  const updateNetworkMedia = useCallback((platformId, mediaUrls) => {
    setDraft((prev) => {
      const currentNet = prev.networkCustom[platformId] || { useTemplate: true, caption: "", mediaUrls: [] }
      return {
        ...prev,
        networkCustom: {
          ...prev.networkCustom,
          [platformId]: { ...currentNet, mediaUrls },
        },
      }
    })
  }, [])

  // Toggle Use Template for a specific network
  const toggleUseTemplate = useCallback((platformId, value) => {
    setDraft((prev) => {
      const currentNet = prev.networkCustom[platformId] || { useTemplate: true, caption: "", mediaUrls: [] }
      const newUseTemplate = value !== undefined ? value : !currentNet.useTemplate

      // Turning template off for the first time: carry over the shared
      // caption/mediaUrls as the starting point to edit, instead of an empty
      // box the user would have to retype/reselect from scratch. Only seeds
      // when this platform has no custom content yet, so re-toggling later
      // never clobbers what the user already typed here.
      const isFirstCustomization = newUseTemplate === false && !currentNet.caption && currentNet.mediaUrls.length === 0
      const seededNet = isFirstCustomization
        ? { ...currentNet, caption: prev.caption, mediaUrls: [...prev.mediaUrls] }
        : currentNet

      return {
        ...prev,
        networkCustom: {
          ...prev.networkCustom,
          [platformId]: {
            ...seededNet,
            useTemplate: newUseTemplate,
          },
        },
      }
    })
  }, [])

  // Threads specific helpers (Multi-post Threading)
  const updateThreadPostText = useCallback((index, text) => {
    setDraft((prev) => {
      const threadsState = prev.networkCustom.THREADS || { threadPosts: [""], mediaUrls: [] }
      const newPosts = [...threadsState.threadPosts]
      newPosts[index] = text
      return {
        ...prev,
        networkCustom: {
          ...prev.networkCustom,
          THREADS: {
            ...threadsState,
            threadPosts: newPosts,
          },
        },
      }
    })
  }, [])

  const addThreadPost = useCallback(() => {
    setDraft((prev) => {
      const threadsState = prev.networkCustom.THREADS || { threadPosts: [""], mediaUrls: [] }
      const newPosts = [...threadsState.threadPosts, ""]
      return {
        ...prev,
        networkCustom: {
          ...prev.networkCustom,
          THREADS: {
            ...threadsState,
            activeThreadIndex: newPosts.length - 1,
            threadPosts: newPosts,
          },
        },
      }
    })
  }, [])

  const removeThreadPost = useCallback((index) => {
    setDraft((prev) => {
      const threadsState = prev.networkCustom.THREADS || { threadPosts: [""], mediaUrls: [] }
      if (threadsState.threadPosts.length <= 1) return prev
      const newPosts = threadsState.threadPosts.filter((_, i) => i !== index)
      return {
        ...prev,
        networkCustom: {
          ...prev.networkCustom,
          THREADS: {
            ...threadsState,
            activeThreadIndex: Math.max(0, (threadsState.activeThreadIndex || 0) - 1),
            threadPosts: newPosts,
          },
        },
      }
    })
  }, [])

  const setThreadActiveIndex = useCallback((index) => {
    setDraft((prev) => {
      const threadsState = prev.networkCustom.THREADS || { threadPosts: [""], mediaUrls: [] }
      return {
        ...prev,
        networkCustom: {
          ...prev.networkCustom,
          THREADS: {
            ...threadsState,
            activeThreadIndex: index,
          },
        },
      }
    })
  }, [])

  // Toggle selected platform. Also keeps activeNetworkTab (compose pane, left
  // column) in sync with selectedPlatforms (icon row) — without this, deselecting
  // the platform currently open in the compose pane left its tab pointing at a
  // platform no longer in the tab list (isThreadsTab etc. stayed true with no
  // visible active tab to show it), and re-selecting it didn't restore focus to
  // that tab even though its networkCustom data was never lost.
  const togglePlatform = useCallback((platformId) => {
    setSelectedPlatforms((prev) => {
      const isSelected = prev.includes(platformId)
      const next = isSelected ? prev.filter((p) => p !== platformId) : [...prev, platformId]
      if (!isSelected) {
        setActivePreviewPlatform(platformId)
        setActiveNetworkTab(platformId)
      } else {
        if (next.length > 0) setActivePreviewPlatform(next[0])
        setActiveNetworkTab((prevTab) => (prevTab === platformId ? NETWORK_TAB_TEMPLATE : prevTab))
      }
      return next
    })
  }, [])

  // Apply template
  const applyTemplate = useCallback((templateId) => {
    const tpl = POST_TEMPLATES.find((t) => t.id === templateId)
    if (!tpl) return
    setDraft((prev) => ({
      ...prev,
      caption: tpl.caption,
      title: tpl.title,
    }))
    setSelectedPlatforms(tpl.platforms)
    setPostFormat(tpl.format)
    setActivePreviewPlatform(tpl.platforms[0] || "INSTAGRAM")
    setIsTemplateModalOpen(false)
    toast.success(`Đã áp dụng mẫu "${tpl.title}"`)
  }, [])

  // Add reviewer
  const addReviewer = useCallback((reviewerName) => {
    if (!reviewerName.trim()) return
    setReviewers((prev) => [
      ...prev,
      { id: `rev_${Date.now()}`, name: reviewerName, role: "Reviewer", avatar: reviewerName.slice(0, 2).toUpperCase() },
    ])
  }, [])

  const removeReviewer = useCallback((id) => {
    setReviewers((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // Real-time validation issues via Strategy Pattern & ErrorRegistry.
  const validationIssues = useMemo(() => {
    let allErrors = []
    selectedPlatforms.forEach((pId) => {
      const strategy = PlatformStrategyRegistry.getStrategy(pId)
      const netCustom = draft.networkCustom?.[pId]
      const effectiveCap = (netCustom && !netCustom.useTemplate)
        ? (pId === SOCIAL_PLATFORM.THREADS ? netCustom.threadPosts?.[0] : netCustom.caption)
        : draft.caption
      const effectiveMed = (netCustom && !netCustom.useTemplate && netCustom.mediaUrls?.length > 0)
        ? netCustom.mediaUrls
        : draft.mediaUrls

      const pErrors = strategy.validate(effectiveCap || "", effectiveMed || [], postFormat, {
        youtubeOptions: draft.youtubeOptions,
        pendingFiles: [...pendingFiles.values()],
        platformLimits,
      })
      allErrors = [...allErrors, ...pErrors]
    })
    ErrorRegistry.setErrors(allErrors)
    return allErrors
  }, [selectedPlatforms, draft, postFormat, pendingFiles, platformLimits])

  const hasBlockingErrors = useMemo(() => {
    return validationIssues.some((issue) => issue.severity === "error")
  }, [validationIssues])

  // Submit handler.
  const handleSubmit = async (isDraftMode = false) => {
    if (!isDraftMode && hasBlockingErrors) {
      toast.error("Vui lòng khắc phục các lỗi vi phạm trước khi gửi duyệt / lên lịch!")
      return
    }

    setIsSubmitting(true)
    try {
      let finalMediaUrls = draft.mediaUrls
      let finalMediaMeta = draft.mediaMeta
      const resolved = new Map()

      if (pendingFiles.size > 0) {
        let lastSuccess = null
        for (const [blobUrl, file] of pendingFiles) {
          const result = await postService.uploadMedia(brandId, selectedPlatforms, file)
          resolved.set(blobUrl, result.videoUrl)
          lastSuccess = result
        }
        finalMediaUrls = draft.mediaUrls.map((url) => resolved.get(url) ?? url)
        finalMediaMeta = lastSuccess ? { sizeMb: lastSuccess.sizeMb, duration: lastSuccess.duration } : draft.mediaMeta
      }

      // Build networkOverrides from draft.networkCustom — only platforms the
      // user actually customized (useTemplate === false) get a row; blob:
      // URLs picked while customizing a platform go through the same
      // resolved map as the shared mediaUrls above, so overrides never ship
      // a local-only blob reference to the backend.
      const networkOverrides = selectedPlatforms
        .map((pId) => {
          const netCustom = draft.networkCustom?.[pId]
          if (!netCustom || netCustom.useTemplate !== false) return null

          if (pId === SOCIAL_PLATFORM.THREADS) {
            const threadPosts = (netCustom.threadPosts || []).map((text) => ({
              text,
              mediaUrls: (netCustom.mediaUrls || []).map((url) => resolved.get(url) ?? url),
            }))
            if (!threadPosts.some((p) => p.text)) return null
            return { platform: pId, useTemplate: false, threadPosts }
          }

          const overrideMediaUrls = (netCustom.mediaUrls || []).map((url) => resolved.get(url) ?? url)
          if (!netCustom.caption && overrideMediaUrls.length === 0) return null
          return { platform: pId, useTemplate: false, caption: netCustom.caption, mediaUrls: overrideMediaUrls }
        })
        .filter(Boolean)

      const payload = {
        brandId,
        title: draft.title || draft.youtubeOptions.title || "Bài viết mới",
        caption: draft.caption,
        targetPlatforms: selectedPlatforms,
        scheduledAt: draft.scheduledAt,
        status: isDraftMode
          ? POST_CREATE_STATUS.DRAFT
          : reviewers.length > 0
          ? POST_CREATE_STATUS.PENDING_APPROVAL
          : POST_CREATE_STATUS.SCHEDULED,
        mediaUrls: finalMediaUrls,
        type: mapPostFormatToPostType(postFormat, finalMediaUrls),
        options: {
          ...draft.presets,
          youtube: draft.youtubeOptions,
          videoSizeMb: finalMediaMeta.sizeMb,
          videoDuration: finalMediaMeta.duration,
        },
        ...(networkOverrides.length > 0 ? { networkOverrides } : {}),
      }

      await postService.createPost(payload)
      draft.mediaUrls.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url)
      })
      toast.success(isDraftMode ? "Đã lưu bản nháp thành công!" : "Đã gửi duyệt bài viết thành công!")
      if (onSuccess) onSuccess()
      if (onClose) onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không tạo được bài viết. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    draft,
    updateDraft,
    updateYoutubeOption,
    addPendingFiles,
    removePendingFile,
    updateNetworkMedia,
    pendingFiles,
    platformLimits,
    updatePreset,
    updateNetworkCaption,
    isEditByNetwork,
    toggleEditByNetwork,
    activeNetworkTab,
    setNetworkTab,
    toggleUseTemplate,
    updateThreadPostText,
    addThreadPost,
    removeThreadPost,
    setThreadActiveIndex,
    selectedPlatforms,
    togglePlatform,
    postFormat,
    setPostFormat,
    activePreviewPlatform,
    setActivePreviewPlatform,
    deviceMode,
    setDeviceMode,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    applyTemplate,
    reviewers,
    addReviewer,
    removeReviewer,
    validationIssues,
    hasBlockingErrors,
    isSubmitting,
    handleSubmit,
  }
}
