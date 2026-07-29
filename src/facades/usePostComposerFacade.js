import { useState, useMemo, useCallback } from "react"
import { PlatformStrategyRegistry } from "@/strategies/PlatformStrategies"
import { ErrorRegistry } from "@/services/ErrorRegistry"
import { POST_TEMPLATES, NETWORK_TAB_TEMPLATE } from "@/constants/postComposer"
import { postService } from "@/services/postService"
import { toast } from "sonner"

export function usePostComposerFacade(initialScheduledAt, brandId, onSuccess, onClose) {
  const [selectedPlatforms, setSelectedPlatforms] = useState(["THREADS", "YOUTUBE"])
  const [postFormat, setPostFormat] = useState("POST")
  const [activePreviewPlatform, setActivePreviewPlatform] = useState("THREADS")
  const [deviceMode, setDeviceMode] = useState("mobile")
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit by network state
  const [isEditByNetwork, setIsEditByNetwork] = useState(true)
  const [activeNetworkTab, setActiveNetworkTab] = useState(NETWORK_TAB_TEMPLATE)

  // Draft state
  const [draft, setDraft] = useState({
    title: "",
    caption: "",
    mediaUrls: [],
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
      THREADS: {
        useTemplate: false,
        activeThreadIndex: 0,
        threadPosts: [
          "",
          "",
        ],
      },
      YOUTUBE: {
        useTemplate: true,
        caption: "",
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
      const currentNet = prev.networkCustom[platformId] || { useTemplate: true, caption: "" }
      return {
        ...prev,
        networkCustom: {
          ...prev.networkCustom,
          [platformId]: { ...currentNet, caption: value },
        },
      }
    })
  }, [])

  // Toggle Use Template for a specific network
  const toggleUseTemplate = useCallback((platformId, value) => {
    setDraft((prev) => {
      const currentNet = prev.networkCustom[platformId] || { useTemplate: true, caption: "" }
      const newUseTemplate = value !== undefined ? value : !currentNet.useTemplate
      return {
        ...prev,
        networkCustom: {
          ...prev.networkCustom,
          [platformId]: {
            ...currentNet,
            useTemplate: newUseTemplate,
          },
        },
      }
    })
  }, [])

  // Threads specific helpers (Multi-post Threading)
  const updateThreadPostText = useCallback((index, text) => {
    setDraft((prev) => {
      const threadsState = prev.networkCustom.THREADS || { threadPosts: [""] }
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
      const threadsState = prev.networkCustom.THREADS || { threadPosts: [""] }
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
      const threadsState = prev.networkCustom.THREADS || { threadPosts: [""] }
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
      const threadsState = prev.networkCustom.THREADS || { threadPosts: [""] }
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

  // Toggle selected platform
  const togglePlatform = useCallback((platformId) => {
    setSelectedPlatforms((prev) => {
      const isSelected = prev.includes(platformId)
      const next = isSelected ? prev.filter((p) => p !== platformId) : [...prev, platformId]
      if (!isSelected) setActivePreviewPlatform(platformId)
      else if (next.length > 0) setActivePreviewPlatform(next[0])
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

  // Real-time validation issues via Strategy Pattern & ErrorRegistry
  const validationIssues = useMemo(() => {
    let allErrors = []
    selectedPlatforms.forEach((pId) => {
      const strategy = PlatformStrategyRegistry.getStrategy(pId)
      const pFormat = postFormat
      const pErrors = strategy.validate(draft.caption, draft.mediaUrls, pFormat, draft.youtubeOptions)
      allErrors = [...allErrors, ...pErrors]
    })
    ErrorRegistry.setErrors(allErrors)
    return allErrors
  }, [selectedPlatforms, draft, postFormat])

  const hasBlockingErrors = useMemo(() => {
    return validationIssues.some((issue) => issue.severity === "error")
  }, [validationIssues])

  // Submit handler
  const handleSubmit = async (isDraftMode = false) => {
    if (!isDraftMode && hasBlockingErrors) {
      toast.error("Vui lòng khắc phục các lỗi vi phạm trước khi gửi duyệt / lên lịch!")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        brandId,
        title: draft.title || draft.youtubeOptions.title || "Bài viết mới",
        caption: draft.caption,
        targetPlatforms: selectedPlatforms,
        scheduledAt: draft.scheduledAt,
        status: isDraftMode ? "DRAFT" : reviewers.length > 0 ? "PENDING_APPROVAL" : "SCHEDULED",
        mediaUrls: draft.mediaUrls,
        type: postFormat,
        options: { ...draft.presets, youtube: draft.youtubeOptions },
      }

      await postService.createPost(payload)
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
