import React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Share2, TrendingUp, Radio } from "lucide-react"

// TODO: Replace with real API data integration when backend metrics endpoints are connected
const MOCK_BENTO_DATA = {
  totalPosts: 24,
  engagementRate: "+12.4%",
  activeChannels: 6,
  upcomingList: [
    { id: 1, title: "Product Feature Launch Video", platform: "YouTube", time: "14:00 Today" },
    { id: 2, title: "Weekly Social Media Tips Infographic", platform: "Facebook", time: "18:30 Tomorrow" },
  ],
}

export default function BentoGrid() {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Total Posts */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">{t("bento.total_posts")}</span>
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold">{MOCK_BENTO_DATA.totalPosts}</div>
          <p className="text-xs text-muted-foreground mt-1">Scheduled for this month</p>
        </div>
      </Card>

      {/* Card 2: Engagement Rate */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">{t("bento.engagement")}</span>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold flex items-center gap-2">
            {MOCK_BENTO_DATA.engagementRate}
            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
              Higher
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Compared to last week</p>
        </div>
      </Card>

      {/* Card 3: Connected Channels */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">{t("bento.active_channels")}</span>
          <Radio className="h-4 w-4 text-blue-500" />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold">{MOCK_BENTO_DATA.activeChannels}</div>
          <p className="text-xs text-muted-foreground mt-1">YouTube, Facebook, LinkedIn...</p>
        </div>
      </Card>

      {/* Card 4: Upcoming Publications (Spans 3 cols) */}
      <Card className="md:col-span-3 p-4">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-sm font-semibold">{t("bento.upcoming")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          {MOCK_BENTO_DATA.upcomingList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-xs"
            >
              <div className="flex items-center gap-3">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.platform}</Badge>
                <span className="text-muted-foreground">{item.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
