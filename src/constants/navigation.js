import {
  LayoutDashboard,
  Calendar,
  Share2,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  CreditCard,
  UserCheck,
  Sliders,
} from "lucide-react"

export const MAIN_NAV_ITEMS = Object.freeze([
  {
    id: "dashboard",
    labelKey: "nav.dashboard",
    path: "/workspace/planner",
    icon: LayoutDashboard,
  },
  {
    id: "planner",
    labelKey: "nav.planner",
    path: "/workspace/planner/calendar",
    icon: Calendar,
  },
  {
    id: "smartlinks",
    labelKey: "nav.smartlinks",
    path: "/manage/smartlinks",
    icon: Share2,
  },
  {
    id: "analytics",
    labelKey: "nav.analytics",
    path: "/manage/reports",
    icon: BarChart3,
  },
  {
    id: "team",
    labelKey: "nav.team",
    path: "/workspace/team",
    icon: Users,
  },
])

export const SETTINGS_DRAWER_SECTIONS = Object.freeze([
  {
    id: "account_workspace",
    titleKey: "settings.sections.account_workspace",
    items: [
      { id: "profile", labelKey: "settings.items.profile", icon: UserCheck },
      { id: "workspace_settings", labelKey: "settings.items.workspace_settings", icon: Settings },
    ],
  },
  {
    id: "users_billing",
    titleKey: "settings.sections.users_billing",
    items: [
      { id: "team_members", labelKey: "settings.items.team_members", icon: Users },
      { id: "billing_plans", labelKey: "settings.items.billing_plans", icon: CreditCard },
    ],
  },
  {
    id: "preferences",
    titleKey: "settings.sections.preferences",
    items: [
      { id: "general_preferences", labelKey: "settings.items.general_preferences", icon: Sliders },
    ],
  },
  {
    id: "support",
    titleKey: "settings.sections.support",
    items: [
      { id: "help_center", labelKey: "settings.items.help_center", icon: HelpCircle },
    ],
  },
])
