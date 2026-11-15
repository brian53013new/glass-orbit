import { cards, type Language, type MissionEvent, type RunState } from '../types'
import type { LiveDonkiStatus } from './nasaLiveService'

export type PlayStyle = 'CAUTIOUS' | 'BALANCED' | 'BOLD'

export type CoachAnalysis = {
  style: PlayStyle
  styleLabel: Record<Language, string>
  avgDecisionSec: number
  weakestKey: 'shield' | 'lifeSupport' | 'power' | 'evidence' | 'comms'
  causalSummary: Record<Language, string>
  tips: Record<Language, string[]>
}

export function analyzeMissionRun(
  run: RunState,
  mission: MissionEvent,
  decisionTimesMs: number[],
): CoachAnalysis {
  const avgMs = decisionTimesMs.length
    ? decisionTimesMs.reduce((sum, v) => sum + v, 0) / decisionTimesMs.length
    : 3200
  const avgDecisionSec = Number((avgMs / 1000).toFixed(1))

  const shieldRatio = run.resources.shield / Math.max(1, mission.shieldTarget)

  let style: PlayStyle = 'BALANCED'
  if (avgMs > 5500 || (shieldRatio >= 1 && run.resources.power >= 2)) style = 'CAUTIOUS'
  else if (avgMs < 2400 && (run.resources.power === 0 || run.played.includes('overdrive'))) style = 'BOLD'

  const styleLabel: Record<Language, string> =
    style === 'CAUTIOUS'
      ? { zh: '穩健防護型', en: 'Cautious Planner' }
      : style === 'BOLD'
        ? { zh: '積極調度型', en: 'Bold Tactician' }
        : { zh: '均衡應變型', en: 'Balanced Commander' }

  let weakestKey: CoachAnalysis['weakestKey'] = 'shield'
  if (run.resources.shield < mission.shieldTarget) weakestKey = 'shield'
  else if (run.resources.lifeSupport < mission.lifeTarget) weakestKey = 'lifeSupport'
  else if (run.evidence < mission.evidenceTarget) weakestKey = 'evidence'
  else if (run.comms < mission.commsTarget) weakestKey = 'comms'
  else if (run.resources.power <= 0) weakestKey = 'power'

  const playedTitlesZh = run.played
    .map((id) => cards.find((c) => c.id === id)?.title.zh ?? id)
    .join(' → ')
  const playedTitlesEn = run.played
    .map((id) => cards.find((c) => c.id === id)?.title.en ?? id)
    .join(' -> ')

  const causalMap: Record<CoachAnalysis['weakestKey'], Record<Language, string>> = {
    shield: {
      zh: `本局出牌順序（${playedTitlesZh || '無'}）結束時護盾 ${run.resources.shield}/${mission.shieldTarget} 格不足，面對 ${mission.speed} km/s 太陽風暴需優先建立儲能與護盾。`,
      en: `Sequence (${playedTitlesEn || 'none'}) ended at Shield ${run.resources.shield}/${mission.shieldTarget}; against a ${mission.speed} km/s CME, prioritize Power Reserve + Shielding early.`,
    },
    lifeSupport: {
      zh: `維生系統僅餘 ${run.resources.lifeSupport}/${mission.lifeTarget} 格，高壓調度後氧氣與水循環餘裕不足。`,
      en: `Life Support ended at ${run.resources.lifeSupport}/${mission.lifeTarget}; cabin air/water reserves ran too thin after power shifts.`,
    },
    evidence: {
      zh: `基地安全但科學證據 ${run.evidence}/${mission.evidenceTarget} 未達標，缺少觀測紀錄與預警驗證。`,
      en: `Base stayed safe, but Science Evidence reached ${run.evidence}/${mission.evidenceTarget}; add observation or forecast plays.`,
    },
    comms: {
      zh: `深空通訊僅 ${run.comms}/${mission.commsTarget} 格，未及時建立地球下行遙測鏈路。`,
      en: `Deep-space Comms reached ${run.comms}/${mission.commsTarget}; align the antenna earlier to link with Earth.`,
    },
    power: {
      zh: `出牌節奏（${playedTitlesZh || '無'}）成功達標！平均每手思考 ${avgDecisionSec} 秒，展現穩健的能源與防護平衡。`,
      en: `Your sequence (${playedTitlesEn || 'none'}) cleared all targets! Averaging ${avgDecisionSec}s/turn, you balanced power and shielding cleanly.`,
    },
  }

  const tips: Record<Language, string[]> = {
    zh: [
      `建議在風暴前 2 回合維持「電力 ≥ 2」作為啟動護盾或維生的安全緩衝。`,
      `利用「對準天線」搭配「CME 到達預報」可免費觸發額外 +1 電力與 +1 護盾。`,
      `本局平均決策時間 ${avgDecisionSec} 秒（${styleLabel.zh}），可匯出報告比較不同策略！`,
    ],
    en: [
      `Keep at least 2 Power in reserve before turn 3 so Shield or Life Support never stalls.`,
      `Pair Align Antenna with CME Arrival Forecast to trigger a free +1 Power & +1 Shield bonus.`,
      `Average decision time: ${avgDecisionSec}s (${styleLabel.en}). Export the report to compare runs!`,
    ],
  }

  return {
    style,
    styleLabel,
    avgDecisionSec,
    weakestKey,
    causalSummary: causalMap[weakestKey],
    tips,
  }
}

export function downloadMissionReport(
  format: 'json' | 'csv',
  run: RunState,
  mission: MissionEvent,
  liveStatus: LiveDonkiStatus,
  coach: CoachAnalysis,
) {
  const timestamp = new Date().toISOString()
  const filename = `glass-orbit-report-${mission.record.activityID.replace(/[^a-zA-Z0-9_-]/g, '_')}.${format}`

  let content = ''
  let mime = 'application/json'

  if (format === 'json') {
    content = JSON.stringify(
      {
        exportedAtUtc: timestamp,
        telemetryFeed: liveStatus,
        mission: {
          activityID: mission.record.activityID,
          cmeSpeedKmS: mission.speed,
          shieldTarget: mission.shieldTarget,
          lifeTarget: mission.lifeTarget,
          evidenceTarget: mission.evidenceTarget,
          commsTarget: mission.commsTarget,
        },
        outcome: run.outcome,
        turnsUsed: run.turns,
        finalResources: {
          ...run.resources,
          evidence: run.evidence,
          comms: run.comms,
        },
        playedSequence: run.played,
        coachAnalysis: {
          playStyle: coach.style,
          avgDecisionSec: coach.avgDecisionSec,
          summary: coach.causalSummary.en,
          tips: coach.tips.en,
        },
      },
      null,
      2,
    )
  } else {
    mime = 'text/csv;charset=utf-8'
    const rows = [
      ['Field', 'Value'],
      ['ExportedAtUTC', timestamp],
      ['TelemetryFeedMode', liveStatus.mode],
      ['NASA_DONKI_ActivityID', mission.record.activityID],
      ['CME_Speed_km_s', String(mission.speed)],
      ['Outcome', run.outcome],
      ['TurnsUsed', String(run.turns)],
      ['Power', String(run.resources.power)],
      ['LifeSupport', `${run.resources.lifeSupport}/${mission.lifeTarget}`],
      ['Shield', `${run.resources.shield}/${mission.shieldTarget}`],
      ['Evidence', `${run.evidence}/${mission.evidenceTarget}`],
      ['Comms', `${run.comms}/${mission.commsTarget}`],
      ['PlayStyle', coach.style],
      ['AvgDecisionSec', String(coach.avgDecisionSec)],
      ['PlayedSequence', run.played.join(' -> ')],
    ]
    content = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  }

  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
