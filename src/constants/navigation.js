import {
  BarChart2,
  Sliders,
  Users,
  FileText,
  Calendar,
  CheckSquare,
  Folder,
  Target,
  LayoutGrid,
  Mail,
  Link,
  Briefcase,
  Globe,
  Palette,
  CreditCard,
  HelpCircle,
  Headphones,
  Newspaper,
  User,
} from "lucide-react"

export const SIDEBAR_NAV_GROUPS = Object.freeze([
  {
    id: "analytics",
    titleKey: "nav.groups.analytics",
    items: [
      { id: "analytics", labelKey: "nav.analytics", path: "/workspace/planner", icon: BarChart2 },
      { id: "scheduler", labelKey: "nav.scheduler", path: "/workspace/planner/calendar", icon: Calendar, activeDot: true },
      { id: "management", labelKey: "nav.management", path: "/workspace/management", icon: Sliders },
      { id: "team", labelKey: "nav.team", path: "/workspace/team", icon: Users },
      { id: "reports", labelKey: "nav.reports", path: "/manage/reports", icon: FileText },
    ],
  },
  {
    id: "tools",
    titleKey: "nav.groups.tools",
    items: [
      { id: "content_planner", labelKey: "nav.content_planner", path: "/workspace/planner/calendar", icon: Calendar },
      { id: "approval_requests", labelKey: "nav.approval_requests", path: "/workspace/approvals", icon: CheckSquare },
      { id: "assets", labelKey: "nav.assets", path: "/workspace/assets", icon: Folder },
      { id: "ads", labelKey: "nav.ads", path: "/workspace/ads", icon: Target },
    ],
  },
])

export const HEADER_TOP_NAV = Object.freeze([
  { id: "dashboard", labelKey: "header.top_nav.dashboard", icon: LayoutGrid, path: "/workspace/planner" },
  { id: "media_library", labelKey: "header.top_nav.media_library", icon: Folder, path: "/workspace/media" },
  { id: "inbox", labelKey: "header.top_nav.inbox", icon: Mail, path: "/workspace/inbox" },
  { id: "planner", labelKey: "header.top_nav.planner", icon: Calendar, path: "/workspace/planner/calendar" },
  { id: "smart_links", labelKey: "header.top_nav.smart_links", icon: Link, path: "/manage/smartlinks" },
])

export const SETTINGS_DRAWER_SECTIONS = Object.freeze([
  {
    id: "system",
    titleKey: "settings.sections.system",
    items: [
      { id: "workspace", labelKey: "settings.items.workspace", icon: Briefcase },
      { id: "connections", labelKey: "settings.items.connections", icon: Link },
      { id: "brand", labelKey: "settings.items.brand", icon: Palette },
    ],
  },
  {
    id: "administration",
    titleKey: "settings.sections.administration",
    items: [
      { id: "user", labelKey: "settings.items.user", icon: User },
      { id: "billing", labelKey: "settings.items.billing", icon: CreditCard },
      { id: "tasks", labelKey: "settings.items.tasks", icon: CheckSquare },
    ],
  },
  {
    id: "preferences",
    titleKey: "settings.sections.preferences",
    items: [
      { id: "language", labelKey: "settings.items.language", icon: Globe },
      { id: "account", labelKey: "settings.items.account", icon: User },
    ],
  },
  {
    id: "help",
    titleKey: "settings.sections.help",
    items: [
      { id: "help_center", labelKey: "settings.items.help_center", icon: HelpCircle },
      { id: "support", labelKey: "settings.items.support", icon: Headphones },
      { id: "news", labelKey: "settings.items.news", icon: Newspaper },
    ],
  },
])
