import type { Language, MissionEvent } from '../types'

export type TelemetryFeedMode = 'LIVE_NASA_DONKI' | 'CACHED_TELEMETRY' | 'OFFLINE_SNAPSHOT'

export type LiveDonkiStatus = {
  mode: TelemetryFeedMode
  latestActivityId: string
  latestSpeedKmS: number
  latestStartTime: string
  fetchedAtUtc: string
}

const CACHE_KEY = 'glass-orbit-donki-live-cache-v1'
const NASA_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'

export function formatFeedBadge(mode: TelemetryFeedMode, language: Language): string {
  if (mode === 'LIVE_NASA_DONKI') return language === 'zh' ? 'NASA 即時連線' : 'LIVE NASA DONKI'
  if (mode === 'CACHED_TELEMETRY') return language === 'zh' ? 'NASA 快取資料' : 'CACHED NASA'
  return language === 'zh' ? 'NASA 離線快照' : 'OFFLINE SNAPSHOT'
}

export async function fetchLiveDonkiStatus(fallbackMission: MissionEvent): Promise<LiveDonkiStatus> {
  const fallback: LiveDonkiStatus = {
    mode: 'OFFLINE_SNAPSHOT',
    latestActivityId: fallbackMission.record.activityID,
    latestSpeedKmS: fallbackMission.speed,
    latestStartTime: fallbackMission.record.startTime,
    fetchedAtUtc: new Date().toISOString(),
  }

  try {
    const end = new Date()
    const start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000)
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    const url = `https://api.nasa.gov/DONKI/CME?startDate=${fmt(start)}&endDate=${fmt(end)}&api_key=${encodeURIComponent(NASA_KEY)}`

    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 3500)
    const res = await fetch(url, { signal: controller.signal })
    window.clearTimeout(timer)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const list = (await res.json()) as Array<{
      activityID?: string
      startTime?: string
      cmeAnalyses?: Array<{ speed?: number; isMostAccurate?: boolean }>
    }>
    if (!Array.isArray(list) || list.length === 0) throw new Error('Empty DONKI list')

    const latest = list[list.length - 1]
    const analysis = latest.cmeAnalyses?.find((a) => a.isMostAccurate) ?? latest.cmeAnalyses?.[0]
    const speed = typeof analysis?.speed === 'number' && analysis.speed > 0 ? Math.round(analysis.speed) : fallbackMission.speed
    const payload: LiveDonkiStatus = {
      mode: 'LIVE_NASA_DONKI',
      latestActivityId: latest.activityID || fallbackMission.record.activityID,
      latestSpeedKmS: speed,
      latestStartTime: latest.startTime || fallbackMission.record.startTime,
      fetchedAtUtc: new Date().toISOString(),
    }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
    } catch {
      // Ignore storage quota errors
    }
    return payload
  } catch {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as LiveDonkiStatus
        if (parsed?.latestActivityId && parsed?.latestSpeedKmS) {
          return { ...parsed, mode: 'CACHED_TELEMETRY' }
        }
      }
    } catch {
      // Ignore corrupt cache
    }
    return fallback
  }
}
