import { POST_STATUS, SOCIAL_PLATFORM } from "@/constants/planner"

export const MOCK_POSTS = [
  {
    id: "post-1",
    title: "New Product Showcase Video",
    platform: SOCIAL_PLATFORM.INSTAGRAM.id,
    status: POST_STATUS.PUBLISHED.id,
    date: "2026-11-18",
    dayIndex: 1, // Mon
    hour: 9,
    timeLabel: "09:00 AM",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80",
  },
  {
    id: "post-2",
    title: "Weekly Team Update & Sync",
    platform: SOCIAL_PLATFORM.FACEBOOK.id,
    status: POST_STATUS.SCHEDULED.id,
    date: "2026-11-19",
    dayIndex: 2, // Tue
    hour: 14,
    timeLabel: "02:30 PM",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&q=80",
  },
  {
    id: "post-3",
    title: "Feature Demo & Walkthrough",
    platform: SOCIAL_PLATFORM.YOUTUBE.id,
    status: POST_STATUS.DRAFTING.id,
    date: "2026-11-20",
    dayIndex: 3, // Wed
    hour: 11,
    timeLabel: "11:15 AM",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&q=80",
  },
  {
    id: "post-4",
    title: "B2B Strategy Guide 2026",
    platform: SOCIAL_PLATFORM.X.id,
    status: POST_STATUS.FAILED.id,
    date: "2026-11-22",
    dayIndex: 5, // Fri
    hour: 17,
    timeLabel: "05:00 PM",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80",
  },
  {
    id: "post-5",
    title: "Q4 Marketing Masterclass",
    platform: SOCIAL_PLATFORM.TIKTOK.id,
    status: POST_STATUS.SCHEDULED.id,
    date: "2026-11-23",
    dayIndex: 6, // Sat
    hour: 10,
    timeLabel: "10:00 AM",
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&q=80",
  },
]

export const MOCK_INSIGHTS = {
  totalPostsMonth: 124,
  scheduledMonth: 32,
  bestTimesData: [
    { hour: "12am", score: 25 },
    { hour: "4am", score: 45 },
    { hour: "8am", score: 85 },
    { hour: "12pm", score: 95 },
    { hour: "4pm", score: 70 },
    { hour: "8pm", score: 80 },
    { hour: "11pm", score: 30 },
  ],
  integrations: [
    { id: "gdrive", name: "Google Drive", connected: true },
    { id: "csv", name: "CSV Import", connected: false },
  ],
}

export const plannerService = {
  async getScheduledPosts() {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_POSTS), 100)
    })
  },
  async getInsights() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_INSIGHTS), 100)
    })
  },
}
