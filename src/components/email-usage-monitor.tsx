'use client'

import { useEffect, useState } from 'react'
import { getEmailUsageStats } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Mail } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function EmailUsageMonitor() {
  const [stats, setStats] = useState<{
    daily: { used: number; limit: number; remaining: number; percentage: number };
    monthly: { used: number; limit: number; remaining: number; percentage: number };
  } | null>(null)

  useEffect(() => {
    const loadStats = () => {
      const usage = getEmailUsageStats()
      setStats(usage)
    }

    loadStats()
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  const dailyWarning = stats.daily.percentage >= 80
  const monthlyWarning = stats.monthly.percentage >= 80
  const dailyCritical = stats.daily.percentage >= 95
  const monthlyCritical = stats.monthly.percentage >= 95

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Usage
        </CardTitle>
        <CardDescription>Resend free tier limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Daily</span>
            <span className={`font-semibold ${dailyWarning ? 'text-amber-600' : ''} ${dailyCritical ? 'text-destructive' : ''}`}>
              {stats.daily.used} / {stats.daily.limit}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                dailyCritical
                  ? 'bg-destructive'
                  : dailyWarning
                  ? 'bg-amber-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(stats.daily.percentage, 100)}%` }}
            />
          </div>
          {dailyWarning && (
            <p className="text-xs text-amber-600">
              {stats.daily.remaining} emails remaining today
            </p>
          )}
        </div>

        {/* Monthly Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Monthly</span>
            <span className={`font-semibold ${monthlyWarning ? 'text-amber-600' : ''} ${monthlyCritical ? 'text-destructive' : ''}`}>
              {stats.monthly.used} / {stats.monthly.limit}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                monthlyCritical
                  ? 'bg-destructive'
                  : monthlyWarning
                  ? 'bg-amber-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(stats.monthly.percentage, 100)}%` }}
            />
          </div>
          {monthlyWarning && (
            <p className="text-xs text-amber-600">
              {stats.monthly.remaining} emails remaining this month
            </p>
          )}
        </div>

        {/* Warnings */}
        {(dailyCritical || monthlyCritical) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Email Limit Warning</AlertTitle>
            <AlertDescription>
              {dailyCritical && `Daily limit almost reached (${stats.daily.used}/${stats.daily.limit}). `}
              {monthlyCritical && `Monthly limit almost reached (${stats.monthly.used}/${stats.monthly.limit}). `}
              Consider upgrading your Resend plan if you need more emails.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

